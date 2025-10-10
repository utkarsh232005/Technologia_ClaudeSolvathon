# Classification System

Advanced dark matter event classification with detailed scientific explanations.

## 📁 Structure

```
classification_system/
├── enhanced_classifier.py       # Main classifier with 7-section explanations
├── mainClassify.py             # Original Gemini-based classifier
├── results/                    # Classification results (JSON)
└── explanations/               # Detailed markdown explanations
```

## 🚀 Quick Start

### 1. Classify Events with Detailed Explanations

```bash
cd classification_system
python enhanced_classifier.py --num-events 5
```

### 2. View Results

- **Summary**: `results/classification_results.json`
- **Detailed Explanations**: `explanations/event_*_explanation.md`

## 📊 Output Format

### Classification Results (`results/classification_results.json`)

```json
[
  {
    "event_id": 1,
    "true_label": "WIMP-like",
    "classification": "WIMP-like (NR)",
    "confidence": 0.85,
    "s2_over_s1_ratio": 3.46,
    "recoil_energy_keV": 12.56,
    "explanation_file": "explanations/event_1_explanation.md"
  }
]
```

### Detailed Explanation (`explanations/event_1_explanation.md`)

Each explanation includes 7 comprehensive sections:

1. **CLASSIFICATION JUSTIFICATION**
   - Step-by-step reasoning
   - Physics principles (ionization, scintillation, recombination)

2. **FEATURE ANALYSIS**
   - S2/S1 Ratio interpretation
   - Energy analysis (WIMP window, backgrounds)
   - Pulse shape characteristics

3. **PHYSICS INTERPRETATION**
   - Interaction type (elastic scattering, Compton, etc.)
   - Nuclear vs electronic recoil
   - Detector response consistency
   - Recombination probability

4. **COMPARISON WITH KNOWN RESULTS**
   - XENONnT published results
   - LUX-ZEPLIN (LZ) data
   - Known background sources

5. **CONFIDENCE ASSESSMENT**
   - Factors increasing confidence
   - Remaining uncertainties
   - Alternative explanations

6. **FOLLOW-UP RECOMMENDATIONS**
   - 5 specific actionable steps
   - Verification methods
   - Cross-validation approaches

7. **LITERATURE REFERENCES**
   - 5 relevant physics papers
   - Detector response studies
   - Experimental results

## 🔧 Configuration

### Environment Variables

Required in `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your key from: https://makersuite.google.com/app/apikey

### Dataset Path

The classifier expects:
- Dataset: `../dataset/dark_matter_synthetic_dataset.csv`
- Located one level up from classification_system folder

## 📈 Usage Examples

### Process 10 Events

```bash
python enhanced_classifier.py --num-events 10
```

### Process Single Event

```bash
python enhanced_classifier.py --num-events 1
```

### Large Batch (25 events)

```bash
python enhanced_classifier.py --num-events 25
```

**Note**: Each event takes ~4-6 seconds (2 API calls: classification + explanation)

## 🎯 Classification Criteria

| Type | S2/S1 Ratio | Energy Range | Characteristics |
|------|-------------|--------------|-----------------|
| **Background (ER)** | > 5 | All | Electronic recoils, gamma/beta |
| **WIMP-like (NR)** | 2.0 - 4.0 | 1-50 keV | Nuclear recoils, low ionization |
| **Axion-like** | < 2.0 | ~14.4 keV | Exotic electron recoils |

## 📝 Output Example

Console output:

```
================================================================================
Processing 5 events with detailed scientific explanations
================================================================================

[1/5] Processing Event (True Label: WIMP-like)
────────────────────────────────────────────────────────────────────────────────
  ⏳ Classifying event...
  ✓ Classification: WIMP-like (NR) (Confidence: 85.00%)
  ⏳ Generating detailed scientific explanation...
  ✓ Explanation generated (3542 characters)
  ✓ Saved to: explanations/event_1_explanation.md

[2/5] Processing Event (True Label: Background)
────────────────────────────────────────────────────────────────────────────────
  ⏳ Classifying event...
  ✓ Classification: Background (ER) (Confidence: 98.00%)
  ⏳ Generating detailed scientific explanation...
  ✓ Explanation generated (3721 characters)
  ✓ Saved to: explanations/event_2_explanation.md

...

================================================================================
✓ Processing complete!
  - Results saved to: results/classification_results.json
  - Detailed explanations in: explanations/
================================================================================

================================================================================
SUMMARY
================================================================================
✓ Event 1: WIMP-like → WIMP-like (NR) (85%)
✓ Event 2: Background → Background (ER) (98%)
✓ Event 3: Axion-like → Axion-like (92%)
✗ Event 4: WIMP-like → Background (ER) (76%)
✓ Event 5: Background → Background (ER) (99%)
================================================================================
```

## 🔬 Scientific Features

### Physics-Based Analysis
- Ionization vs scintillation yields
- Recombination probability
- Quenching factors
- Detector response models

### Literature Comparison
- XENONnT discrimination bands
- LUX-ZEPLIN background models
- Published dark matter limits
- Calibration data

### Experimental Validation
- Fiducial volume checks
- Pulse shape discrimination
- Multiple scatter analysis
- Position-dependent effects

## ⚡ Performance

- **Classification**: ~2 seconds per event
- **Explanation**: ~3-4 seconds per event
- **Total**: ~5-6 seconds per event
- **Rate limiting**: Built-in 2-second delay between events

## 🆘 Troubleshooting

### "GEMINI_API_KEY not found"
→ Add your API key to `.env` file in project root

### "Dataset not found"
→ Run `python main.py` from project root to generate dataset

### API Rate Limit Errors
→ Increase delay in code or process fewer events

## 📚 Related Files

- `../main.py` - Dataset generator
- `../README.md` - Project overview
- `../.env` - API configuration

---

**Created for Technologia ClaudeSolvathon**  
Advanced Dark Matter Detection & Classification System
