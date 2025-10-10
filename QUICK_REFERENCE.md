# Quick Reference: Enhanced Reasoning System

## 🚀 Quick Start

```bash
# 1. Set API key in .env file
# Get your API key from: https://makersuite.google.com/app/apikey
echo "GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE" > .env

# 2. Run classification
cd Technologia_ClaudeSolvathon
python mainClassify.py --num-events 10

# 3. View results
cat claude_classified_results_detailed.json
```

## 📋 10 Reasoning Sections

| # | Section | What It Analyzes |
|---|---------|------------------|
| 1 | **S2/S1 Analysis** | Ratio value, which band (Background/WIMP/Axion), physics interpretation |
| 2 | **Energy Analysis** | WIMP window (1-50 keV), background lines, unusual signatures |
| 3 | **Position Analysis** | Fiducial volume, distance from walls, drift time consistency |
| 4 | **Pulse Characteristics** | S1/S2 widths, timing profiles, anomaly detection |
| 5 | **Physics Interpretation** | Interaction type, recombination, quenching factors |
| 6 | **Literature Comparison** | XENONnT, LUX-ZEPLIN, PandaX results |
| 7 | **Alternative Interpretations** | Other possibilities, why ruled out |
| 8 | **Confidence Factors** | What increases/decreases certainty |
| 9 | **Follow-up Recommendations** | Specific actionable suggestions |

## 🎯 Classification Bands

| Type | S2/S1 Range | Energy | Key Features |
|------|-------------|--------|--------------|
| **Background (ER)** | > 200 | Any | Gamma/beta, high ionization |
| **WIMP-like (NR)** | 10-50 | 1-50 keV | Dark matter, low ionization |
| **Axion-like** | < 10 | ~14.4 keV | Exotic, very low ionization |

## 📊 Feature Analysis (15 Features)

### Primary Features:
- `recoil_energy_keV` - Energy deposited
- `s1_area_PE` - Scintillation light signal
- `s2_area_PE` - Ionization charge signal
- `s2_over_s1_ratio` - **KEY DISCRIMINANT**

### Secondary Features:
- `log10_s2_over_s1` - Log-scale ratio
- `position_x_mm`, `position_y_mm`, `position_z_mm` - 3D location
- `drift_time_us` - Time between S1 and S2
- `s1_width_ns`, `s2_width_us` - Pulse widths
- `event_quality` - Data quality score
- `pile_up_flag` - Multiple interaction indicator
- `interaction_type` - True type (for validation)

## 🔍 Example Output

```
======================================================================
CLASSIFICATION: WIMP-like (NR)
CONFIDENCE: 0.85
======================================================================

S2/S1 ANALYSIS:
The S2/S1 ratio of 23.4 falls squarely within the nuclear recoil band
(10-50), strongly indicating WIMP-nucleus elastic scattering...

ENERGY ANALYSIS:
At 8.5 keV, this event is in the optimal WIMP search window...

[... 7 more sections ...]
```

## 💡 Key Improvements Over Basic System

| Aspect | Basic | Enhanced |
|--------|-------|----------|
| **Reasoning Sections** | 1 | 10 |
| **Features Analyzed** | 7 | 15 |
| **Output Length** | ~50 words | ~500-1000 words |
| **Physics Depth** | Superficial | Comprehensive |
| **Literature References** | None | Multiple |
| **Confidence Explanation** | Score only | Detailed factors |
| **Follow-up Actions** | Generic | Specific, actionable |

## 🎓 Understanding S2/S1 Discrimination

### Why S2/S1 Ratio Matters:

**Nuclear Recoils (WIMPs):**
- Dense ionization tracks
- More recombination → less S2
- More direct scintillation → more S1
- Result: **LOW S2/S1 (10-50)**

**Electronic Recoils (Background):**
- Sparse ionization tracks
- Less recombination → more S2
- Less direct scintillation → less S1
- Result: **HIGH S2/S1 (>200)**

## 📈 Confidence Score Interpretation

| Score | Meaning | Typical Reason |
|-------|---------|----------------|
| **0.9-1.0** | Very High | All features strongly agree, unambiguous classification |
| **0.7-0.9** | High | Most features agree, minor uncertainties |
| **0.5-0.7** | Medium | Mixed signals, borderline features |
| **0.3-0.5** | Low | Conflicting features, unusual event |
| **0.0-0.3** | Very Low | Highly uncertain, potential artifact |

## 🛠️ Command Line Options

```bash
# Basic usage (10 events)
python mainClassify.py

# Classify more events
python mainClassify.py --num-events 50

# Help
python mainClassify.py --help
```

## 📁 Output Files

### 1. `claude_classified_results_detailed.json`
- Full results with all reasoning sections
- Machine-readable JSON format
- Includes raw event data + AI analysis

### 2. Console Output
- Real-time progress
- Formatted reasoning sections
- Easy to read and review

## ⚡ Performance

- **Speed:** ~5-10 seconds per event (API call + processing)
- **Cost:** ~$0.01 per event (Gemini pricing)
- **Accuracy:** Depends on prompt quality and model capability

## 🔧 Troubleshooting

### "API key not found"
```bash
# Check .env file exists
ls .env

# Verify key is set
cat .env | grep GEMINI_API_KEY
```

### "pandas not installed"
```bash
pip install pandas requests python-dotenv
```

### "Dataset not found"
```bash
# Ensure you're in the correct directory
cd Technologia_ClaudeSolvathon

# Check dataset exists
ls dark_matter_synthetic_dataset.csv
```

## 📚 Additional Resources

- `ENHANCED_REASONING_README.md` - Full documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `test_enhanced_reasoning.py` - Test script
- `ENV_SETUP.md` - Environment configuration

## 🎯 Best Practices

1. **Start Small:** Test with 5-10 events first
2. **Review Results:** Check if reasoning makes physical sense
3. **Iterate:** Refine prompt based on output quality
4. **Compare:** Validate against expert classifications
5. **Document:** Keep track of API costs and performance

## 💰 Cost Management

```bash
# For budget-conscious analysis:
# 1. Use smaller num-events (10-20)
# 2. Cache results (avoid re-running same events)
# 3. Use structured output (avoids re-generation)
# 4. Monitor Gemini API quotas
```

## 🤝 Getting Help

1. Check documentation files first
2. Review example output in test script
3. Verify API key and environment setup
4. Check Gemini API status
5. Review error messages carefully

---

**Quick Links:**
- [Full Documentation](./ENHANCED_REASONING_README.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Test Script](./test_enhanced_reasoning.py)
- [Main Classification Script](./mainClassify.py)

**Status:** ✅ Ready to Use
**Version:** 2.0
**Last Updated:** October 10, 2025
