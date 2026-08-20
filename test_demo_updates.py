from datetime import datetime, timedelta
from app import create_app
from app.models.database import db, Medication, User, Seizure, Trigger
from scripts.simulate_patient import demo_username

def test_demo_updates():
    # Create app context
    app = create_app()
    with app.app_context():
        # 1. Check current data
        demo_user = User.query.filter_by(username=demo_username).first()
        print("\n=== Current Data Status ===")
        print(f"Demo User exists: {demo_user is not None}")
        
        if demo_user:
            # Get latest entries
            latest_med = (Medication.query.filter_by(user_id=demo_user.id)
                         .order_by(Medication.timestamp.desc())
                         .first())
            latest_seizure = (Seizure.query.filter_by(user_id=demo_user.id)
                            .order_by(Seizure.timestamp.desc())
                            .first())
            latest_trigger = (Trigger.query.filter_by(user_id=demo_user.id)
                            .order_by(Trigger.timestamp.desc())
                            .first())
            
            print("\n=== Latest Entry Dates ===")
            print(f"Latest Medication: {latest_med.timestamp if latest_med else 'None'}")
            print(f"Latest Seizure: {latest_seizure.timestamp if latest_seizure else 'None'}")
            print(f"Latest Trigger: {latest_trigger.timestamp if latest_trigger else 'None'}")
            
            # Count entries in last 24 hours
            yesterday = datetime.now() - timedelta(days=1)
            recent_meds = (Medication.query.filter_by(user_id=demo_user.id)
                         .filter(Medication.timestamp >= yesterday)
                         .count())
            recent_seizures = (Seizure.query.filter_by(user_id=demo_user.id)
                             .filter(Seizure.timestamp >= yesterday)
                             .count())
            recent_triggers = (Trigger.query.filter_by(user_id=demo_user.id)
                             .filter(Trigger.timestamp >= yesterday)
                             .count())
            
            print("\n=== Entries in Last 24 Hours ===")
            print(f"Medications: {recent_meds}")
            print(f"Seizures: {recent_seizures}")
            print(f"Triggers: {recent_triggers}")

if __name__ == "__main__":
    test_demo_updates() 