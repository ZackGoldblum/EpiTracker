from app import create_app
from app.models.database import db, User
from app.services.demo_service import needs_demo_data_update, update_demo_data
from dotenv import load_dotenv


def main():
    load_dotenv()  # Load environment variables from .env file
    app = create_app()
    with app.app_context():
        demo_user = User.query.filter_by(username="Demo Patient").first()
        if not demo_user:
            print("Demo user does not exist. Seeding database.")
            from scripts.simulate_patient import seed_database

            seed_database()
        else:
            if needs_demo_data_update():
                print("Updating demo data...")
                update_demo_data()
            else:
                print("Demo data is already up-to-date.")


if __name__ == "__main__":
    main()
