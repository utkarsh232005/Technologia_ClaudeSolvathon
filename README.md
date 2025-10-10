# Dark Matter Event Classification Project

This project generates synthetic dark matter detector data and classifies candidate events using a local deterministic heuristic.

## Files

### Core Scripts
- **`main.py`** - Generates synthetic dataset (50,000 events) from a liquid xenon detector simulation
- **`mainClassify.py`** - Classifies candidate events using local heuristics (no API required)

### Generated Outputs
- **`dark_matter_synthetic_dataset.csv`** - Main dataset with all events
- **`dark_matter_synthetic_dataset.json`** - JSON version of dataset
- **`dataset_metadata.json`** - Metadata about the generated dataset
- **`classified_events_with_reasoning.json`** - Classification results with reasoning
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
pip install pandas numpy
```

### 2. Generate Dataset
```powershell
python main.py
```
This creates the synthetic dataset files.

### 3. Classify Events
```powershell
# Classify 10 labeled candidate events
python mainClassify.py --num-events 10 --use-labels

# Classify 5 events using S2/S1 threshold (default: 500)
python mainClassify.py --num-events 5 --s2s1-threshold 500

# See all options
python mainClassify.py --help
```

## Classification Logic

The local classifier uses deterministic heuristics:

- **WIMP-like**: S2/S1 < 500 AND energy 1-60 keV (nuclear recoil signature)
- **Axion-like**: Energy near 14.4 keV (within 0.5 keV)
- **Background**: High S2/S1 ratio or outside energy range (electronic recoil)

### Key Features
- **S2/S1 ratio**: Primary discriminator between nuclear recoils (NR) and electronic recoils (ER)
- **Recoil energy**: Helps identify specific dark matter candidates
- **Position data**: Available for spatial analysis

## Dataset Statistics

- **Total events**: 50,000
- **Signal types**: WIMP-like, Axion-like, Sterile-Neutrino, Primordial-BH
- **Background**: Electronic recoils from gamma/beta sources
- **Energy range**: 0.5 - 100 keV
- **Detector**: Simulated liquid xenon TPC

## Command Line Options

```
--num-events N        Number of events to classify (default: 5)
--s2s1-threshold T    S2/S1 upper cutoff for candidates (default: 500.0)
--use-labels          Select candidates using dataset labels (label != 'Background')
```

## Output Format

`classified_events_with_reasoning.json` contains:
```json
[
  {
    "event_id": 12345,
    "recoil_energy_keV": 15.2,
    "s2_area_PE": 850.3,
    "s1_area_PE": 42.1,
    ...
    "analysis": {
      "label": "WIMP-like",
      "confidence": 0.6,
      "reasoning": "s2/s1=20.2 | Low-ish S2/S1 and energy in WIMP search range",
      "s2s1": 20.2
    }
  }
]
```

## Notes

- This is a **local-only** classifier (no API calls, fully offline)
- Perfect for testing and development without costs
- All reasoning is deterministic and reproducible
- Based on real dark matter detection physics principles

## Next Steps

- Add unit tests for classification logic
- Implement advanced statistical analysis
- Compare with ML-based classifiers
- Add visualization tools for event distributions
