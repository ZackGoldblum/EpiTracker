from app import app
from app.models.database import db
from scripts.simulate_patient import seed_database


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
    init_db(with_demo_data=True)
    app.run(debug=True)
