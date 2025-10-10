#!/usr/bin/env python3
"""
Simple test script to verify Claude API configuration
"""
import os
from dotenv import load_dotenv
import anthropic

# Load environment variables
load_dotenv()

def test_claude_api():
    api_key = os.getenv("CLAUDE_API_KEY")
    if not api_key or api_key == "sk-ant-api03-your_claude_api_key_here":
        print("❌ ERROR: Please set your actual Claude API key in the .env file")
        print("   Replace 'sk-ant-api03-your_claude_api_key_here' with your real API key")
        return False
    
    try:
        # Initialize the Anthropic client
        client = anthropic.Anthropic(api_key=api_key)
        
        # Simple test request
        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=100,
            temperature=0.0,
            messages=[
                {
                    "role": "user",
                    "content": "Say 'Claude API is working!' in exactly those words."
                }
            ]
        )
        
        if message.content and len(message.content) > 0:
            response_text = message.content[0].text
            print(f"✅ SUCCESS: {response_text}")
            return True
        else:
            print(f"❌ UNEXPECTED RESPONSE: {message}")
            return False
            
    except anthropic.APIError as e:
        print(f"❌ CLAUDE API ERROR: {e}")
        return False
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Testing Claude API Configuration...")
    test_claude_api()
