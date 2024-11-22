from flask import Blueprint, render_template
from flask_login import login_required, current_user
from app.models.database import Medication, Seizure, Trigger

# Create the Blueprint
main_bp = Blueprint("main", __name__)


@main_bp.route("/")
@login_required
def dashboard():
    return render_template("pages/dashboard.html")


@main_bp.route("/medication-log")
@login_required
def medication_log():
    medications = Medication.query.filter_by(user_id=current_user.id).all()
    return render_template("pages/medication_log.html", medications=medications)


@main_bp.route("/seizure-log")
@login_required
def seizure_log():
    seizures = Seizure.query.filter_by(user_id=current_user.id).all()
    return render_template("pages/seizure_log.html", seizures=seizures)


@main_bp.route("/triggers-log")
@login_required
def triggers_log():
    triggers = Trigger.query.filter_by(user_id=current_user.id).all()
    return render_template("pages/triggers_log.html", triggers=triggers)


@main_bp.route("/insights")
@login_required
def insights():
    return render_template("pages/insights.html")
