from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

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
    name = db.Column(db.String(100), nullable=False)
    dosage = db.Column(db.String(100), nullable=False)
    time = db.Column(db.DateTime, nullable=False)
    taken = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


class Seizure(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    date_time = db.Column(db.DateTime, nullable=False)
    type = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.Integer, nullable=False)  # 1-10 scale
    duration = db.Column(db.Integer)  # in minutes


class Trigger(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    type = db.Column(db.String(100), nullable=False)
    date_time = db.Column(db.DateTime, nullable=False)
    notes = db.Column(db.Text)
