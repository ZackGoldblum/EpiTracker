from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import UniqueConstraint

db = SQLAlchemy()


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    medications = db.relationship("Medication", backref="user", lazy=True)
    seizures = db.relationship("Seizure", backref="user", lazy=True)
    triggers = db.relationship("Trigger", backref="user", lazy=True)


class Medication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    dosage = db.Column(db.String(100), nullable=False)
    taken = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "user_id", "name", "dosage", "taken", "timestamp", name="_medication_uc"
        ),
    )


class Seizure(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    type = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.Integer, nullable=False)  # 1-10 scale
    duration = db.Column(db.Integer)  # in minutes
    timestamp = db.Column(db.DateTime, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "user_id", "type", "severity", "duration", "timestamp", name="_seizure_uc"
        ),
    )


class Trigger(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    type = db.Column(db.String(100), nullable=False)
    notes = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "type", "notes", "timestamp", name="_trigger_uc"),
    )


class InsightHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    analysis = db.Column(db.Text, nullable=False)
    generated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
