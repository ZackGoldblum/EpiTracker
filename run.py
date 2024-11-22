from app import app
from app.models.database import db
from scripts.simulate_patient import seed_database
import argparse

def init_db(with_demo_data=False):
    with app.app_context():
        print("Dropping existing database...")
        db.drop_all()
        print("Creating new database...")
        db.create_all()
        print("Database initialized successfully!")
        
        if with_demo_data:
            print("Seeding database with demo data...")
            seed_database()
            print("Demo data added successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run the TrackEPI application')
    parser.add_argument('--init-db', action='store_true',
                       help='Initialize a fresh database')
    parser.add_argument('--demo-data', action='store_true',
                       help='Add demo patient data (requires --init-db)')
    
    args = parser.parse_args()
    
    if args.init_db:
        init_db(with_demo_data=args.demo_data)
    else:
        # Always ensure tables exist when running the app
        with app.app_context():
            db.create_all()
    
    app.run(debug=True)
