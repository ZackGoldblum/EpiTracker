# BE 5280 Project

## Overview
A web application designed to improve epilepsy management in ambulatory settings. The application helps users track medications, seizures, and potential triggers through an intuitive calendar-based interface.

## Features
- **User Authentication**: Secure login and registration system
- **Dashboard**: Overview of medications, seizures, and triggers with interactive calendars
- **Medication Tracking**: Log and monitor daily medication schedules
- **Seizure Logging**: Record seizure events with type, severity, and duration
- **Trigger Management**: Track potential seizure triggers
- **Calendar Integration**: Visual representation of all health events
- **Insights**: Generate and view analyses of historic health data

## Design
![screencapture-127-0-0-1-5000-2024-12-06-10_04_12](https://github.com/user-attachments/assets/a54818d5-acd6-4e92-a867-596086813929)

## Project Structure
```
BE-5280-Project/
├── app/                           # Application package
│   ├── config/                    # Configuration files
│   ├── models/                    # Database models
│   ├── static/                    # Static files (CSS, JS, images)
│   │   ├── css/                   # CSS stylesheets
│   │   └── js/                    # JavaScript files
│   ├── routes/                    # Route blueprints
│   │   ├── api.py                 # API routes
│   │   ├── auth.py                # Authentication routes
│   │   └── main.py                # Main page routes
│   ├── services/                  # Service modules
│   │   ├── openai_service.py      # OpenAI integration
│   │   └── pharmacokinetics.py    # Drug level calculations
│   └── templates/                 # HTML templates
│       ├── pages/                 # Page templates
│       └── base.html              # Base template
├── scripts/                       # Utility scripts
│   └── simulate_patient.py        # Demo data generation
├── .env                           # Environment variables
├── .gitignore                     # Git ignore file
├── README.md                      # Project documentation
└── requirements.txt               # Python dependencies
└── run.py                         # Application entry point
```

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ZackGoldblum/BE-5280-Project.git
cd BE-5280-Project
```

### 2. Create and Activate Virtual Environment

#### On Windows:
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate
```

#### On macOS/Linux:
```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Initialize the Database
```bash
python init-db.py
```

To initialize the database with demo patient data:
```bash
python init_db.py --demo
```

### 5. Create a `.env` file
```bash
MODEL="gpt-4o-mini"
OPENAI_API_KEY="<YOUR-OPENAI-API-KEY>"
```

### 6. Run the Web Application
```bash
# Start the Flask server (creates database by default)
python run.py

# Initialize a fresh database and start
python run.py --init-db

# Initialize with demo data and start
python run.py --init-db --demo-data
```

The web application will be available at `http://127.0.0.1:5000/`

## Technologies Used
- **Backend**: Python, Flask
- **Database**: SQLAlchemy with SQLite
- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: Flask-Login
- **UI Components**: Custom-built calendar and modal systems
- **AI**: OpenAI API for generating insights from the data

## How to Contribute

### Step 1: Create a New Branch
```bash
# Create and switch to a new branch from main
git checkout -b your-feature-name

# Example:
git checkout -b calendar-improvements
```

### Step 2: Create a Pull Request
1. Push your changes to GitHub
```bash
git add .
git commit -m "Add your changes"
git push origin your-feature-name
```

2. Go to [GitHub](https://github.com/ZackGoldblum/BE-5280-Project) and create a pull request from `your-feature-name` branch to `main`

## Security Notes
- Passwords are hashed using Werkzeug's security functions
- Session management is handled by Flask-Login
- Secret keys and API keys are managed through environment variables
