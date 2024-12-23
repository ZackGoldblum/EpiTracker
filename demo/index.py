from app import app as application
from app.models.database import db
from scripts.simulate_patient import seed_database, demo_username
from app.services.demo_service import needs_demo_data_update, update_demo_data
from flask import session, current_app
from flask_login import login_user
from app.models.database import User
import logging

# Configure logging
logging.basicConfig(
    filename='demo_updates.log',
    level=logging.INFO,
    format='%(asctime)s:%(levelname)s:%(message)s'
)

@application.before_request
def before_request():
    try:
        with application.app_context():
            db.create_all()
            
            # Check if demo user exists
            demo_user = User.query.filter_by(username=demo_username).first()
            if not demo_user:
                logging.info("Demo user not found. Seeding database...")
                seed_database()
                demo_user = User.query.filter_by(username=demo_username).first()
                logging.info("Database seeded successfully.")
            
            # Check if demo data needs updating
            if needs_demo_data_update():
                logging.info("Updating demo data...")
                update_demo_data()
                logging.info("Demo data updated successfully.")
            
            # Force login the demo user without password check
            if not session.get('_user_id'):
                login_user(demo_user, force=True)
                
    except Exception as e:
        logging.error(f"Error in before_request: {str(e)}")

# Need to modify the app config for Vercel
application.config.update(
    SERVER_NAME=None,
    PREFERRED_URL_SCHEME='https'
)

app = application