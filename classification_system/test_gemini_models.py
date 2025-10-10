import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# Test different model endpoints
models_to_test = [
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-2.0-flash-exp",
]

print("Testing Gemini API models...\n")

for model in models_to_test:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
    
    payload = {
        "contents": [{
            "parts": [{"text": "Hello"}]
        }]
    }
    
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print(f"✓ {model}: WORKS!")
        else:
            print(f"✗ {model}: {response.status_code} - {response.text[:100]}")
    except Exception as e:
        print(f"✗ {model}: Error - {str(e)[:100]}")

print("\nTesting models list endpoint...")
list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
try:
    response = requests.get(list_url)
    if response.status_code == 200:
        models = response.json().get('models', [])
        print(f"\n✓ Available models ({len(models)} found):")
        for m in models[:10]:  # Show first 10
            print(f"   - {m.get('name', 'unknown')}")
    else:
        print(f"✗ List models: {response.status_code}")
except Exception as e:
    print(f"✗ List models error: {e}")
