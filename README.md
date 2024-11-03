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

## Design
The UI/UX design specifications for this project can be found in our [Figma Design Document](https://www.figma.com/design/xQAEsSvGQf7qSOuBbyZCcJ/BE-5280-Project).

## Project Structure
```
BE-5280-Project/
├── static/                         # Static files (CSS, JS, images)
│   ├── css/                        # CSS stylesheets
│   │   ├── style.css               # Main stylesheet
│   │   └── calendar.css            # Calendar-specific styles
│   ├── js/                         # JavaScript files
│   │   ├── calendar.js             # Calendar functionality
│   │   └── alerts.js               # Alert system
│   └── images/                     # Image assets
├── templates/                      # HTML templates
│   ├── base.html                   # Base template with common layout
│   └── pages/                      # Individual page templates
│       ├── login.html
│       ├── register.html
│       ├── dashboard.html
│       ├── medication_log.html
│       ├── seizure_log.html
│       └── triggers_log.html
├── models/                         # Database models
│   └── database.py                 # SQLAlchemy models
├── app.py                          # Main Flask application file
├── requirements.txt                # Python dependencies
├── .gitignore                      # Git ignore file
└── README.md                       # Project documentation
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

### 5. Run the Web Application
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