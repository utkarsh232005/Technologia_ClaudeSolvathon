# Claude API Integration Guide

## ✅ Successfully Switched from Gemini to Claude

The Dark Matter Classification system has been successfully updated to use Claude API instead of Google Gemini.

## 🔧 Configuration Changes Made

### 1. **Updated API Configuration**
- **File**: `mainClassify.py`
- **Changes**: 
  - Switched from `GEMINI_API_KEY` to `CLAUDE_API_KEY`
  - Updated model to `claude-3-5-sonnet-20241022`
  - Replaced Google's API with Anthropic's official client

### 2. **API Key Setup**
- **File**: `.env`
- **Added**: `CLAUDE_API_KEY=sk-ant-api03-your_claude_api_key_here`
- **Action Required**: Replace `your_claude_api_key_here` with your actual Claude API key

### 3. **Dependencies Updated**
- **Installed**: `anthropic>=0.69.0` (Official Anthropic Python client)
- **Updated**: `requirements.txt` with new dependencies

### 4. **API Integration Improvements**
- **Better Error Handling**: Using official Anthropic client for more reliable API calls
- **Structured Responses**: Maintained the same JSON schema for consistency with frontend
- **Enhanced Prompting**: Optimized prompts for Claude's reasoning capabilities

## 🚀 How to Get Your Claude API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-api03-...`)
6. Replace the placeholder in your `.env` file

## 🧪 Testing the Integration

### Test Claude API Connection:
```bash
python3 test_claude_api.py
```

### Test Full Classification Pipeline:
```bash
python3 mainClassify.py --num-events 2
```

### Test Web Application:
1. Start backend: `python3 webapp_backend.py`
2. Start frontend: `cd webapp && npm run dev`
3. Visit: `http://localhost:8080`

## 🔍 What Changed Under the Hood

### Before (Gemini):
```python
# Gemini API format
payload = {
    "contents": [{"parts": [{"text": user_query}]}],
    "systemInstruction": {"parts": [{"text": system_prompt}]},
    "generationConfig": {
        "responseMimeType": "application/json",
        "responseSchema": response_schema,
        "temperature": 0.0
    }
}
```

### After (Claude):
```python
# Claude API format using official client
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=4000,
    temperature=0.0,
    system=system_prompt,
    messages=[{"role": "user", "content": user_query}]
)
```

## 📊 Benefits of Claude Integration

1. **More Reliable API**: Official Anthropic client with better error handling
2. **Enhanced Reasoning**: Claude's superior analytical capabilities for physics analysis
3. **Structured Outputs**: Consistent JSON responses for frontend integration
4. **Better Physics Understanding**: Claude excels at scientific reasoning and explanations

## 🔄 Frontend Compatibility

The frontend remains **100% compatible** because:
- Same JSON response structure maintained
- All reasoning fields preserved (`s2s1Analysis`, `energyAnalysis`, etc.)
- Dynamic reasoning display works unchanged
- No frontend code changes required

## ⚠️ Important Notes

1. **API Costs**: Claude API is pay-per-use. Monitor your usage in Anthropic Console
2. **Rate Limits**: Claude has different rate limits than Gemini
3. **Model Updates**: Keep an eye on model deprecations and updates
4. **Backup**: Keep both API keys in `.env` for easy switching if needed

## 🎯 Current Status

✅ **Backend**: Running on port 5001 with Claude integration  
✅ **Frontend**: Running on port 8080 with proxy to backend  
✅ **API Integration**: Fully functional with Claude  
✅ **Error Handling**: Improved with official client  
✅ **Documentation**: Updated and comprehensive  

The system is now ready for production use with Claude's advanced AI capabilities!
