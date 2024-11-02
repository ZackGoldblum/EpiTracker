# BE-5280-Project: Improving Epilepsy Management in Ambulatory Settings

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