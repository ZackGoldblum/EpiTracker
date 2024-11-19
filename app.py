from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import (
    LoginManager,
    login_user,
    login_required,
    logout_user,
    current_user,
)
from models.database import db, User, Medication, Seizure, Trigger, InsightHistory
from werkzeug.security import generate_password_hash, check_password_hash
from openai_service import generate_insights
from models.pharmacokinetics import calculate_drug_levels
import json

app = Flask(__name__)
app.config["SECRET_KEY"] = "your-secret-key"  # Change this in production
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///epilepsy.db"

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

db.init_app(app)

# Load drug parameters from JSON file
with open('drug_params.json') as f:
    DRUG_PARAMS = json.load(f)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.route("/")
@login_required
def dashboard():
    return render_template("pages/dashboard.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        user = User.query.filter_by(username=request.form["username"]).first()
        if user and check_password_hash(user.password, request.form["password"]):
            login_user(user)
            return redirect(url_for("dashboard"))
        else:
            flash("Invalid credentials", "error")
    return render_template("pages/login.html")


@app.route("/medication-log")
@login_required
def medication_log():
    medications = Medication.query.filter_by(user_id=current_user.id).all()
    return render_template("pages/medication_log.html", medications=medications)


@app.route("/seizure-log")
@login_required
def seizure_log():
    seizures = Seizure.query.filter_by(user_id=current_user.id).all()
    return render_template("pages/seizure_log.html", seizures=seizures)


@app.route("/triggers-log")
@login_required
def triggers_log():
    triggers = Trigger.query.filter_by(user_id=current_user.id).all()
    return render_template("pages/triggers_log.html", triggers=triggers)


@app.route('/api/events/<event_type>')
@login_required
def get_events(event_type):
    if event_type == 'medication':
        events = Medication.query.filter_by(user_id=current_user.id).all()
    elif event_type == 'seizure':
        events = Seizure.query.filter_by(user_id=current_user.id).all()
    elif event_type == 'trigger':
        events = Trigger.query.filter_by(user_id=current_user.id).all()
    else:
        return jsonify([])
    
    return jsonify([{
        'id': e.id,
        'date': e.timestamp.isoformat() if hasattr(e, 'timestamp') else e.timestamp.isoformat(),
        'type': event_type
    } for e in events])

@app.route("/add_medication", methods=["POST"])
@login_required
def add_medication():
    try:
        # Get the medication name (either from select or custom input)
        name = request.form.get("name") or request.form.get("custom_name")
        
        # Combine dosage value and unit
        dosage_value = request.form.get("dosage_value")
        dosage_unit = request.form.get("dosage_unit")
        dosage = f"{dosage_value} {dosage_unit}"
        
        datetime_str = request.form.get("datetime")
        medication_datetime = datetime.strptime(datetime_str, '%Y-%m-%dT%H:%M')
        # Truncate seconds and microseconds
        medication_datetime = medication_datetime.replace(second=0, microsecond=0)
        
        medication = Medication(
            name=name,
            dosage=dosage,
            timestamp=medication_datetime,
            user_id=current_user.id
        )
        
        db.session.add(medication)
        db.session.commit()
        
        flash("Medication added successfully!")
        return redirect(url_for("medication_log"))
    except Exception as e:
        flash("Error adding medication. Please try again.")
        return redirect(url_for("medication_log"))

@app.route('/add_seizure', methods=['POST'])
@login_required
def add_seizure():
    try:
        # Get the seizure type (either from select or custom input)
        seizure_type = request.form.get("type") or request.form.get("custom_type")
        
        # Parse and truncate timestamp
        timestamp = datetime.strptime(request.form['timestamp'], '%Y-%m-%dT%H:%M')
        timestamp = timestamp.replace(second=0, microsecond=0)
        
        seizure = Seizure(
            user_id=current_user.id,
            timestamp=timestamp,
            type=seizure_type,
            severity=int(request.form['severity']),
            duration=int(request.form['duration'])
        )
        db.session.add(seizure)
        db.session.commit()
        
        flash("Seizure logged successfully!")
        return redirect(url_for('seizure_log'))
    except Exception as e:
        flash("Error logging seizure. Please try again.")
        return redirect(url_for('seizure_log'))

@app.route("/add_trigger", methods=["POST"])
@login_required
def add_trigger():
    try:
        # Get the trigger type (either from select or custom input)
        trigger_type = request.form.get("type") or request.form.get("custom_type")
        notes = request.form.get("notes")
        
        # Parse and truncate timestamp
        datetime_str = request.form.get("timestamp")
        trigger_datetime = datetime.strptime(datetime_str, '%Y-%m-%dT%H:%M')
        trigger_datetime = trigger_datetime.replace(second=0, microsecond=0)
        print(trigger_datetime)
        
        trigger = Trigger(
            type=trigger_type,
            notes=notes,
            timestamp=trigger_datetime,
            user_id=current_user.id
        )
        
        db.session.add(trigger)
        db.session.commit()
        
        flash("Trigger logged successfully!")
        return redirect(url_for("triggers_log"))
    except Exception as e:
        flash("Error logging trigger. Please try again.")
        return redirect(url_for("triggers_log"))

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/update_medication/<int:medication_id>', methods=['POST'])
@login_required
def update_medication_status(medication_id):
    medication = Medication.query.get_or_404(medication_id)
    if medication.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    medication.taken = not medication.taken
    db.session.commit()
    return jsonify({'success': True})

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        if User.query.filter_by(username=username).first():
            flash("Username already exists", "error")
            return render_template("pages/register.html")
        password = request.form.get("password")
        
        # Create new user
        new_user = User(
            username=username,
            password=generate_password_hash(password)
        )
        db.session.add(new_user)
        db.session.commit()
        
        flash("Registration successful! Please login.", "success")
        return redirect(url_for("login"))
    
    return render_template("pages/register.html")

@app.route('/api/daily-logs/<date>')
@login_required
def get_daily_logs(date):
    try:
        date_obj = datetime.strptime(date, '%Y-%m-%d')
        next_day = date_obj + timedelta(days=1)
        
        medications = Medication.query.filter(
            Medication.user_id == current_user.id,
            Medication.timestamp >= date_obj,
            Medication.timestamp < next_day
        ).all()
        
        seizures = Seizure.query.filter(
            Seizure.user_id == current_user.id,
            Seizure.timestamp >= date_obj,
            Seizure.timestamp < next_day
        ).all()
        
        triggers = Trigger.query.filter(
            Trigger.user_id == current_user.id,
            Trigger.timestamp >= date_obj,
            Trigger.timestamp < next_day
        ).all()
        
        return jsonify({
            'medications': [{
                'id': med.id,
                'name': med.name,
                'dosage': med.dosage,
                'timestamp': med.timestamp.isoformat()
            } for med in medications],
            'seizures': [{
                'id': seizure.id,
                'type': seizure.type,
                'severity': seizure.severity,
                'duration': seizure.duration,
                'timestamp': seizure.timestamp.isoformat()
            } for seizure in seizures],
            'triggers': [{
                'id': trigger.id,
                'type': trigger.type,
                'notes': trigger.notes,
                'timestamp': trigger.timestamp.isoformat()
            } for trigger in triggers]
        })
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

@app.route("/insights")
@login_required
def insights():
    return render_template("pages/insights.html")

@app.route("/api/insights", methods=["POST"])
@login_required
def get_insights():
    data = request.get_json()
    start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
    end_date = datetime.strptime(data['end_date'], '%Y-%m-%d') + timedelta(days=1)

    # Fetch data for the specified date range
    medications = Medication.query.filter(
        Medication.user_id == current_user.id,
        Medication.timestamp >= start_date,
        Medication.timestamp < end_date
    ).all()

    seizures = Seizure.query.filter(
        Seizure.user_id == current_user.id,
        Seizure.timestamp >= start_date,
        Seizure.timestamp < end_date
    ).all()

    triggers = Trigger.query.filter(
        Trigger.user_id == current_user.id,
        Trigger.timestamp >= start_date,
        Trigger.timestamp < end_date
    ).all()

    # Format data for analysis
    formatted_medications = [{
        'name': med.name,
        'dosage': med.dosage,
        'timestamp': med.timestamp.strftime('%Y-%m-%d %H:%M'),
        'taken': med.taken
    } for med in medications]

    formatted_seizures = [{
        'type': seiz.type,
        'severity': seiz.severity,
        'duration': seiz.duration,
        'timestamp': seiz.timestamp.strftime('%Y-%m-%d %H:%M')
    } for seiz in seizures]

    formatted_triggers = [{
        'type': trig.type,
        'notes': trig.notes,
        'timestamp': trig.timestamp.strftime('%Y-%m-%d %H:%M')
    } for trig in triggers]

    try:
        # Get raw markdown from OpenAI
        analysis = generate_insights(
            data['start_date'],
            data['end_date'],
            formatted_medications,
            formatted_seizures,
            formatted_triggers
        )
        
        # Save to history
        history_entry = InsightHistory(
            user_id=current_user.id,
            start_date=start_date,
            end_date=end_date,
            analysis=analysis
        )
        db.session.add(history_entry)
        db.session.commit()
        
        # Return raw markdown instead of HTML
        return jsonify({'success': True, 'analysis': analysis})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route("/api/insights/history")
@login_required
def get_insights_history():
    history = InsightHistory.query.filter_by(user_id=current_user.id)\
        .order_by(InsightHistory.generated_at.desc())\
        .limit(10)\
        .all()
    
    return jsonify([{
        'start_date': h.start_date.strftime('%Y-%m-%d'),
        'end_date': h.end_date.strftime('%Y-%m-%d'),
        'analysis': h.analysis,
        'generated_at': h.generated_at.isoformat()
    } for h in history])

@app.route('/api/drug_levels/<medication_name>')
@login_required
def get_drug_levels(medication_name):
    # Get days parameter from query string, default to 7 days
    days = int(request.args.get('days', 7))
    
    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Get medication history for the user within date range
    medications = Medication.query.filter(
        Medication.user_id == current_user.id,
        Medication.name == medication_name,
        Medication.timestamp >= start_date,
        Medication.timestamp <= end_date
    ).order_by(Medication.timestamp.asc()).all()
    
    if medication_name not in DRUG_PARAMS:
        return jsonify({'error': 'Medication not supported'}), 400
    
    times, concentrations = calculate_drug_levels(medications, DRUG_PARAMS[medication_name])
    
    return jsonify({
        'times': [t.isoformat() for t in times],
        'concentrations': concentrations,
        'therapeutic_range': {
            'min': DRUG_PARAMS[medication_name]['therapeutic_min'],
            'max': DRUG_PARAMS[medication_name]['therapeutic_max']
        }
    })


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
