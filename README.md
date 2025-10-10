# Dark Matter Event Classification Project

This project generates synthetic dark matter detector data and classifies candidate events using Google's Gemini AI API for advanced scientific reasoning.

## Project Structure

```
Technologia_ClaudeSolvathon/
├── main.py                              # Dataset generator (50,000 events)
├── mainClassify.py                      # AI-powered event classifier
├── requirements.txt                     # Python dependencies
├── README.md                            # This file
├── .env.example                         # Environment variable template
├── dark_matter_synthetic_dataset.csv    # Generated dataset
├── dark_matter_synthetic_dataset.json   # Dataset (JSON format)
├── dataset_metadata.json                # Dataset statistics
├── claude_classified_results_detailed.json  # Classification results
└── webapp/                              # Web application (React + Vite)
    ├── src/                             # Source code
    ├── public/                          # Static assets
    └── package.json                     # NPM dependencies
```

## Core Components

### Backend (Python)
- **`main.py`** - Generates synthetic dark matter detector events
- **`mainClassify.py`** - Classifies events using Google Gemini AI

### Frontend (React + TypeScript)
- **`webapp/`** - Interactive web interface for data visualization and analysis

### Configuration
- **`.env`** - API keys (gitignored - never commit!)
- **`.env.example`** - Template for team setup
- **`requirements.txt`** - Python package dependencies

## Quick Start (Windows PowerShell)

### 1. Setup Python Environment
```powershell
# Create virtual environment
python -m venv .venv

# Activate it
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure API Key
```powershell
# Copy the environment template
Copy-Item .env.example .env

# Edit .env and add your Gemini API key
# Get your key from: https://makersuite.google.com/app/apikey
notepad .env
```

### 3. Generate Dataset
```powershell
# Generate 50,000 synthetic dark matter events
python main.py
```

### 4. Run Classification
```powershell
# Classify a small sample
python mainClassify.py --num-events 10

# Classify more events (takes longer)
python mainClassify.py --num-events 50

# Results saved to: claude_classified_results_detailed.json
```

### 5. Launch Web Application
```powershell
# Navigate to webapp directory
cd webapp

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

The webapp will be available at `http://localhost:5173`

## Classification Logic

The Gemini AI classifier uses advanced scientific reasoning based on:

- **S2/S1 Ratio Bands**:
  - High S2/S1 (>5): Background (Electronic Recoil - ER)
  - Medium S2/S1 (2.0-4.0): WIMP-like (Nuclear Recoil - NR)
  - Low S2/S1 (<2.0): Axion-like (Exotic Electron Recoil)

- **Recoil Energy**: Identifies specific dark matter signatures
- **Position Data**: Spatial analysis capabilities

### Key Features
- **AI-powered reasoning**: Detailed scientific explanations for each classification
- **Structured JSON output**: Consistent schema for programmatic analysis
- **Rate limiting**: Built-in retry logic with exponential backoff
- **Confidence scores**: Probabilistic assessment of each classification

## Dataset Statistics

- **Total events**: 50,000
- **Signal types**: WIMP-like, Axion-like, Sterile-Neutrino, Primordial-BH
- **Background**: Electronic recoils from gamma/beta sources
- **Energy range**: 0.5 - 100 keV
- **Detector**: Simulated liquid xenon TPC

## Output Format

`claude_classified_results_detailed.json` contains:
```json
[
  {
    "event_id": 14638,
    "recoil_energy_keV": 56.74,
    "s2_area_PE": 3615.47,
    "s1_area_PE": 10.0,
    "s2s1_ratio": 361.55,
    "classification": {
      "label": "Background (ER)",
      "confidence": 1.00,
      "reasoning": "The S2/S1 ratio of 361.55 is significantly greater than...",
      "s2s1_band": "High S2/S1 (>5) - Electronic Recoil"
    }
  }
]
```

## Security Best Practices

- ✅ Never commit `.env` files - API keys must remain secret
- ✅ `.env` is in `.gitignore` - Safe by default
- ✅ Use `.env.example` for documentation - Share template, not secrets
- ⚠️ Rotate keys if exposed - Get new API key from Google

## Technologies

**Backend:**
- Python 3.11+
- pandas, numpy - Data processing
- python-dotenv - Environment management
- requests - API calls
- Google Gemini AI - Event classification

**Frontend:**
- React 18 - UI framework
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling
- shadcn/ui - Component library

## Next Steps

- [ ] Add unit tests for classification logic
- [ ] Implement result visualization in webapp
- [ ] Add statistical analysis tools
- [ ] Create comparison with ML classifiers
- [ ] Deploy webapp to production

## License

This project is for educational and research purposes.
