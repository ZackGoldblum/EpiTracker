import json

# Load drug parameters
with open("app/config/drug_params.json") as f:
    DRUG_PARAMS = json.load(f)
