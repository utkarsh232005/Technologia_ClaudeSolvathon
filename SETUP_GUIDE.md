# 🚀 Setup Instructions - Dark Matter Classification

## Prerequisites

- Python 3.11 or higher
- Git
- A Google account (for Gemini API key)

## Step-by-Step Setup

### 1. Clone the Repository

```powershell
git clone https://github.com/Rishiraj-Pathak-27/Technologia_ClaudeSolvathon.git
cd Technologia_ClaudeSolvathon
```

### 2. Create Virtual Environment

```powershell
# Create virtual environment
python -m venv .venv

# Activate it (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# If you get execution policy error, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 4. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (it will look like `AIzaSy...`)

### 5. Configure Environment Variables

```powershell
# Copy the template
Copy-Item .env.example .env

# Open .env file in editor
notepad .env
```

Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

**⚠️ Important:** Never commit the `.env` file! It's already in `.gitignore`.

### 6. Generate Dataset

```powershell
# Generate 50,000 synthetic dark matter events
python main.py
```

This creates files in the `dataset/` folder:
- `dark_matter_synthetic_dataset.csv` - Main dataset
- `dark_matter_synthetic_dataset.json` - JSON format
- `dataset_metadata.json` - Statistics

### 7. Run Classification

```powershell
# Test with 3 events first
python mainClassify.py --num-events 3

# Run with more events (10-25 recommended)
python mainClassify.py --num-events 10

# Results saved to: claude_classified_results_detailed.json
```

### 8. (Optional) Launch Web Application

```powershell
cd webapp

# Install Node.js dependencies (first time only)
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 📁 Project Structure

```
Technologia_ClaudeSolvathon/
├── main.py                          # Dataset generator
├── mainClassify.py                  # AI classifier
├── requirements.txt                 # Python dependencies
├── .env                            # Your API keys (DO NOT COMMIT)
├── .env.example                    # Template (safe to commit)
├── dataset/                        # Generated data
│   ├── dark_matter_synthetic_dataset.csv
│   ├── dark_matter_synthetic_dataset.json
│   └── dataset_metadata.json
└── webapp/                         # React web app
    ├── src/
    └── package.json
```

---

## 🔧 Troubleshooting

### "GEMINI_API_KEY not found"
- Make sure `.env` file exists in the project root
- Check that you replaced `YOUR_GEMINI_API_KEY_HERE` with your actual key
- Verify the file is named `.env` (not `.env.txt`)

### "API Request Failed: 400 Bad Request"
- Your API key might be invalid or expired
- Generate a new key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Make sure the Gemini API is enabled

### "FileNotFoundError: dataset/dark_matter_synthetic_dataset.csv"
- Run `python main.py` first to generate the dataset
- Make sure the `dataset/` folder exists

### Virtual environment not activating
```powershell
# For PowerShell execution policy issues:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try activating again:
.\.venv\Scripts\Activate.ps1
```

---

## 🎯 Quick Commands Reference

```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Generate dataset
python main.py

# Classify 10 events
python mainClassify.py --num-events 10

# Start webapp
cd webapp; npm run dev

# Deactivate virtual environment
deactivate
```

---

## 🔐 Security Best Practices

✅ **Never commit `.env` files**  
✅ **Use `.env.example` for templates**  
✅ **Rotate API keys if exposed**  
✅ **Keep `.gitignore` up to date**  

---

## 📚 Additional Documentation

- `README.md` - Project overview
- `ENHANCED_REASONING_README.md` - Details on AI classification
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation
- `QUICK_REFERENCE.md` - Quick reference guide

---

## 🆘 Need Help?

If you encounter issues:
1. Check the Troubleshooting section above
2. Verify your API key is valid
3. Make sure all dependencies are installed
4. Check that Python 3.11+ is installed

---

## 📊 Expected Results

After running `python mainClassify.py --num-events 10`, you should see:
- Progress for each event being analyzed
- Event ID and true label
- AI classification result
- Confidence score
- Detailed scientific reasoning
- Results saved to `claude_classified_results_detailed.json`

Example output:
```
Sampling 10 events for API analysis (Signals: 5, Backgrounds: 5).
--- Analyzing Event 12345 (True Label: WIMP-like) ---
Classification: WIMP-like (NR) (Conf: 0.85)
Reasoning: S2/S1 ratio of 3.2 falls in medium band...
```

---

**Happy classifying! 🎉**
