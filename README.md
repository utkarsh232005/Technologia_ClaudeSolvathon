# Dark Matter Event Classification Project

This project generates synthetic dark matter detector data and classifies candidate events using Google's Gemini AI API for advanced scientific reasoning.

## Files

### Core Scripts
- **`main.py`** - Generates synthetic dataset (50,000 events) from a liquid xenon detector simulation
- **`mainClassify.py`** - Classifies candidate events using Google Gemini API

### Configuration
- **`.env`** - Environment variables (API key) - **DO NOT COMMIT**
- **`.env.example`** - Template for environment setup
- **`requirements.txt`** - Python dependencies
- **`ENV_SETUP.md`** - Detailed security and setup guide

### Generated Outputs
- **`dark_matter_synthetic_dataset.csv`** - Main dataset with all events
- **`dark_matter_synthetic_dataset.json`** - JSON version of dataset
- **`dataset_metadata.json`** - Metadata about the generated dataset
- **`claude_classified_results_detailed.json`** - AI classification results with detailed reasoning
- **`background_events.csv`** - Background events only
- **`candidate_events.csv`** - Candidate events (non-background)

## Quick Start (Windows PowerShell)

### 1. Setup Environment
```powershell
# Create virtual environment
python -m venv .venv

# Activate it
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure API Key (for mainClassify.py)
```powershell
# Copy the environment template
Copy-Item .env.example .env

# Edit .env and add your Gemini API key
# Get your key from: https://makersuite.google.com/app/apikey
notepad .env
```

### 3. Generate Dataset
```powershell
python main.py
```
This creates the synthetic dataset files (50,000 events).

### 4. Run Classification (using Gemini API)
```powershell
# Classify a small sample first
python mainClassify.py --num-events 3

# Classify more events
python mainClassify.py --num-events 50

# Results saved to: claude_classified_results_detailed.json
```

**⚠️ Important:** Make sure you've configured the API key in step 2. See [ENV_SETUP.md](ENV_SETUP.md) for detailed security information.

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

## Command Line Options

```
--num-events N        Number of events to classify (default: 5)
```

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
    ...
    "classification": {
      "label": "Background (ER)",
      "confidence": 1.00,
      "reasoning": "The S2/S1 ratio of 361.55 is significantly greater than the 5.0 threshold...",
      "s2s1_band": "High S2/S1 (>5) - Electronic Recoil"
    }
  }
]
```

## Security Best Practices

- **Never commit .env files** - Your API key should remain secret
- **.env is already in .gitignore** - Safe by default
- **Use .env.example for documentation** - Share the template, not the secrets
- **Rotate keys if exposed** - Get a new API key from Google if your key is accidentally committed

See [ENV_SETUP.md](ENV_SETUP.md) for complete setup instructions.

## Notes

- This classifier uses **Google Gemini AI** for advanced scientific reasoning
- Requires API key (see setup instructions above)
- Rate limiting built-in to prevent API quota exhaustion
- All classifications include detailed scientific explanations
- Based on real dark matter detection physics principles

## Next Steps

- Add unit tests for classification logic
- Implement advanced statistical analysis
- Compare with ML-based classifiers
- Add visualization tools for event distributions
