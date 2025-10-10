import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
print(f"API Key loaded: {'Yes' if API_KEY else 'No'}")

# Simple test call
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"

payload = {
    "contents": [{
        "parts": [{"text": "Say hello!"}]
    }]
}

headers = {'Content-Type': 'application/json'}

try:
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    response.raise_for_status()
    result = response.json()
    print("SUCCESS!")
    if 'candidates' in result:
        print(f"Response text: {result['candidates'][0]['content']['parts'][0]['text']}")
except Exception as e:
    print(f"Error: {e}")
