from app import app, db
from models.database import User, Medication, Seizure, Trigger
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
import random

def create_demo_user():
    # Create demo user
    demo_user = User(
        username="demo_patient",
        password=generate_password_hash("demo123")
    )
    return demo_user

def generate_medication_schedule(user_id, start_date, end_date):
    medications = []
    current_date = start_date
    
    # Morning and evening Levetiracetam
    while current_date <= end_date:
        # Morning dose (8 AM)
        morning_time = current_date.replace(hour=8, minute=0)
        # Occasionally miss or delay morning dose (10% chance)
        if random.random() > 0.1:
            medications.append(Medication(
                name="Levetiracetam",
                dosage="500 mg",
                time=morning_time,
                taken=True,
                user_id=user_id
            ))
        
        # Evening dose (8 PM)
        evening_time = current_date.replace(hour=20, minute=0)
        # Occasionally miss or delay evening dose (15% chance)
        if random.random() > 0.15:
            medications.append(Medication(
                name="Levetiracetam",
                dosage="500 mg",
                time=evening_time,
                taken=True,
                user_id=user_id
            ))
        
        current_date += timedelta(days=1)
    
    return medications

def generate_seizure_events(user_id, start_date, end_date, missed_meds):
    seizures = []
    # Generate seizures with higher probability on days with missed medications
    for missed_med in missed_meds:
        if random.random() < 0.7:  # Chance of seizure after missed medication
            seizure_time = missed_med.time + timedelta(hours=random.randint(2, 8))
            if start_date <= seizure_time <= end_date:
                seizures.append(Seizure(
                    user_id=user_id,
                    date_time=seizure_time,
                    type=random.choice(["Tonic-Clonic", "Focal", "Absence"]),
                    severity=random.randint(3, 8),
                    duration=random.randint(1, 5)
                ))
    
    # Add some random seizures
    current_date = start_date
    while current_date <= end_date:
        if random.random() < 0.15:  # Chance of random seizure on any day
            seizure_time = current_date.replace(
                hour=random.randint(8, 22),
                minute=random.randint(0, 59)
            )
            seizures.append(Seizure(
                user_id=user_id,
                date_time=seizure_time,
                type=random.choice(["Tonic-Clonic", "Focal", "Absence"]),
                severity=random.randint(3, 8),
                duration=random.randint(1, 5)
            ))
        current_date += timedelta(days=1)
    
    return seizures

def generate_triggers(user_id, seizures, start_date, end_date):
    triggers = []
    
    # Common triggers
    trigger_types = [
        "Stress", "Lack of Sleep", "Flashing Lights", "Dehydration",
        "Exercise", "Anxiety", "Illness/Fever"
    ]
    
    # Add triggers correlated with seizures
    for seizure in seizures:
        if random.random() < 0.85:  # Chance of identified trigger before seizure
            trigger_time = seizure.date_time - timedelta(hours=random.randint(1, 4))
            trigger_type = random.choice(trigger_types)
            
            notes = ""
            if trigger_type == "Stress":
                notes = random.choice([
                    "Work deadline", "Family event", "Financial concerns",
                    "Moving house", "Job interview"
                ])
            elif trigger_type == "Lack of Sleep":
                notes = f"Only got {random.randint(3, 5)} hours of sleep"
            
            triggers.append(Trigger(
                user_id=user_id,
                type=trigger_type,
                date_time=trigger_time,
                notes=notes
            ))
    
    # Add some random triggers that didn't result in seizures
    current_date = start_date
    while current_date <= end_date:
        if random.random() < 0.15:  # Chance of random trigger on any day
            trigger_time = current_date.replace(
                hour=random.randint(8, 22),
                minute=random.randint(0, 59)
            )
            triggers.append(Trigger(
                user_id=user_id,
                type=random.choice(trigger_types),
                date_time=trigger_time,
                notes="Potential trigger - no seizure occurred"
            ))
        current_date += timedelta(days=1)
    
    return triggers

def seed_database():
    with app.app_context():
        # Clear existing data
        User.query.delete()
        Medication.query.delete()
        Seizure.query.delete()
        Trigger.query.delete()
        
        # Set date range 
        end_date = datetime.now().replace(hour=23, minute=59, second=59)  # Today's date
        start_date = end_date - timedelta(days=90)
        
        # Create demo user
        demo_user = create_demo_user()
        db.session.add(demo_user)
        db.session.commit()
        
        # Generate medication schedule
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
        
        print("Database seeded successfully!")
        print(f"Demo user created with username: 'demo_patient' and password: 'demo123'")
        print(f"Generated {len(medications)} medication entries")
        print(f"Generated {len(seizures)} seizure events")
        print(f"Generated {len(triggers)} trigger events")

if __name__ == "__main__":
    seed_database() 