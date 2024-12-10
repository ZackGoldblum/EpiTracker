from datetime import datetime, timedelta
from app.models.database import db, Medication, User
from scripts.simulate_patient import (
    generate_medication_schedule,
    generate_seizure_events,
    generate_triggers,
    demo_username,
)


def needs_demo_data_update():
    """Check if demo patient's data needs updating"""
    # Get demo user
    demo_user = User.query.filter_by(username=demo_username).first()
    if not demo_user:
        return True

    # Get the most recent medication entry
    latest_med = (
        Medication.query.filter_by(user_id=demo_user.id)
        .order_by(Medication.timestamp.desc())
        .first()
    )
    if not latest_med:
        return True

    # Check if the latest entry is from today
    today = datetime.now().replace(hour=23, minute=59, second=59)
    return latest_med.timestamp.date() < today.date()


def update_demo_data():
    """Update demo patient's data to current date"""
    # Get demo user
    demo_user = User.query.filter_by(username=demo_username).first()
    if not demo_user:
        return

    # Get the last entry date
    latest_med = (
        Medication.query.filter_by(user_id=demo_user.id)
        .order_by(Medication.timestamp.desc())
        .first()
    )
    start_date = (
        latest_med.timestamp + timedelta(days=1)
        if latest_med
        else datetime.now() - timedelta(days=90)
    )
    end_date = datetime.now().replace(hour=23, minute=59, second=59)

    # Generate new data from last entry to current date
    medications = generate_medication_schedule(demo_user.id, start_date, end_date)
    db.session.bulk_save_objects(medications)
    db.session.commit()

    # Find missed medications
    missed_meds = [m for m in medications if not m.taken]

    # Generate seizure events
    seizures = generate_seizure_events(demo_user.id, start_date, end_date, missed_meds)
    db.session.bulk_save_objects(seizures)
    db.session.commit()

    # Generate triggers
    triggers = generate_triggers(demo_user.id, seizures, start_date, end_date)
    db.session.bulk_save_objects(triggers)
    db.session.commit()

    print(
        f"Demo data updated: {len(medications)} medications, {len(seizures)} seizures, {len(triggers)} triggers"
    )
