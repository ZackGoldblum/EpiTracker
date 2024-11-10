from app import app, db
from simulate_patient import seed_database
import argparse

def init_db(with_demo_data=False):
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database initialized successfully!")
        
        # Optionally add demo data
        if with_demo_data:
            seed_database()

if __name__ == "__main__":
    # Set up command line argument parsing
    parser = argparse.ArgumentParser(description='Initialize the database')
    parser.add_argument('--demo', action='store_true', 
                       help='Include demo patient data in initialization')
    
    args = parser.parse_args()
    
    # Initialize database with or without demo data
    init_db(with_demo_data=args.demo)
