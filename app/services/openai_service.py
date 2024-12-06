# import os
# from openai import OpenAI
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()

# # Set up OpenAI client
# client = OpenAI()
# with open("app/config/system_prompt.txt", "r") as f:
#     SYSTEM_PROMPT = f.read().strip() 

# def generate_insights(start_date, end_date, medications, seizures, triggers):
#     """
#     Generates analysis and recommendations based on patient data.

#     Parameters:
#     - start_date (str): Start date in YYYY-MM-DD format.
#     - end_date (str): End date in YYYY-MM-DD format.
#     - medications (list): List of medication records.
#     - seizures (list): List of seizure records.
#     - triggers (list): List of trigger records.

#     Returns:
#     - str: Analysis and recommendations from OpenAI.
#     """
#     # Construct the prompt
#     prompt = (
#         f"Here is the data from {start_date} to {end_date}.\n\n"
#         f"Medications:\n"
#     )
#     for med in medications:
#         prompt += f"- {med['name']} ({med['dosage']}) at {med['timestamp']}. Taken: {'Yes' if med['taken'] else 'No'}\n"

#     prompt += "\nSeizures:\n"
#     for seiz in seizures:
#         prompt += f"- {seiz['type']} seizure on {seiz['timestamp']} with severity {seiz['severity']} and duration {seiz['duration']} minutes.\n"

#     prompt += "\nTriggers:\n"
#     for trig in triggers:
#         prompt += f"- {trig['type']} on {trig['timestamp']}. Notes: {trig.get('notes', 'N/A')}\n"

#     # Define the messages for ChatCompletion
#     messages = [
#         {"role": "system", "content": SYSTEM_PROMPT},
#         {"role": "user", "content": prompt}
#     ]

#     try:
#         # Call OpenAI API
#         response = client.chat.completions.create(
#             model=os.getenv("MODEL", "gpt-4o-mini"),
#             messages=messages,
#             temperature=float(os.getenv("TEMPERATURE", 0.7)),
#         )
#         analysis = response.choices[0].message.content.strip()
#         return analysis
#     except Exception as e:
#         print(f"OpenAI API error: {e}")
#         return "Failed to generate insights. Please try again later." 