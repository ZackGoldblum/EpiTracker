# BE 5280 Project

## Overview
A web application designed to improve epilepsy management in ambulatory settings.

## Design
The UI/UX design specifications for this project can be found in our [Figma Design Document](https://www.figma.com/design/xQAEsSvGQf7qSOuBbyZCcJ/BE-5280-Project).

## Project Structure
```
BE-5280-Project/
├── static/                # Static files (CSS, JS, images)
│   ├── css/               # CSS stylesheets
│   ├── js/                # JavaScript files
│   └── images/            # Image assets
├── templates/             # HTML templates
│   ├── base.html          # Base template with common layout
│   └── pages/             # Individual page templates
├── app.py                 # Main Flask application file
├── requirements.txt       # Python dependencies
├── .gitignore             # Git ignore file
└── README.md              # Project documentation
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
venv\Scripts\activate
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

### 4. Run the Web Application

```bash
# Start the Flask server
python app.py
```

The web application will be available at `http://127.0.0.1:5000/`

## How to Contribute

### Step 1: Create a New Branch
```bash
# Create and switch to a new branch from main
git checkout -b feature/your-feature-name

# Example:
git checkout -b feature/login-page
```

### Step 2: Create a Pull Request
1. Push your changes to GitHub
```bash
git add .
git commit -m "Add your changes"
git push origin feature/your-feature-name
```

2. Go to [GitHub](https://github.com/ZackGoldblum/BE-5280-Project) and create a pull request from `your-feature-name` branch to `main`