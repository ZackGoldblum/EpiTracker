from app import app as application
from app.models.database import db
from scripts.simulate_patient import seed_database, demo_username
from flask import session
from flask_login import login_user
from app.models.database import User

@application.before_request
def before_request():
    # Create tables if they don't exist
    with application.app_context():
        db.create_all()
        
        # Check if demo user exists
        demo_user = User.query.filter_by(username=demo_username).first()
        if not demo_user:
            # Seed database with demo data
            seed_database()
            demo_user = User.query.filter_by(username=demo_username).first()
        
        # Force login the demo user without password check
        if not session.get('_user_id'):  # Only if not already logged in
            login_user(demo_user, force=True)

# Need to modify the app config for Vercel
application.config.update(
    SERVER_NAME=None,
    PREFERRED_URL_SCHEME='https'
)

app = application