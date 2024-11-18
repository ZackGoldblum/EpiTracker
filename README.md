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
The UI/UX design specifications for this project can be found in our [Figma Design Document](https://www.figma.com/design/xQAEsSvGQf7qSOuBbyZCcJ/BE-5280-Project).

## Project Structure
```
BE-5280-Project/
├── static/                         # Static files (CSS, JS, images)
│   ├── css/                        # CSS stylesheets
│   │   ├── calendar.css            # Calendar-specific styles
│   │   └──  style.css               # Main stylesheet
│   ├── js/                         # JavaScript files
│   │   ├── alerts.js               # Alert system
│   │   ├── calendar.js             # Calendar functionality
│   │   ├── form-utils.js           # Form utilities
│   │   └── mobile_nav.js           # Mobile navigation
│   └── images/                     # Image assets
├── templates/                      # HTML templates
│   ├── base.html                   # Base template with common layout
│   └── pages/                      # Individual page templates
│       ├── dashboard.html
│       ├── insights.html
│       ├── login.html
│       ├── medication_log.html
│       ├── register.html
│       ├── seizure_log.html
│       └── triggers_log.html
├── models/                         # Database models
│   └── database.py                 # SQLAlchemy models
├── .env                            # Environment variables
├── .gitignore                      # Git ignore file
├── app.py                          # Main Flask application file
├── init_db.py                      # Database initialization script
├── openai_service.py               # Service for interacting with OpenAI API
├── README.md                       # Project documentation
├── requirements.txt                # Python dependencies
├── simulate_patient.py             # Script to seed the database with demo data
└── system_prompt.txt               # System prompt for OpenAI API
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
# Start the Flask server
python app.py
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