# Physics-Based Hypothesis Generation Feature

## Overview
The `mainClassify.py` script now includes an advanced **Physics-Based Hypothesis Generation** system that automatically identifies anomalous detector events and generates detailed scientific hypotheses to explain them.

## Features

### 🔍 Anomaly Detection
The system automatically identifies anomalous events based on:
- **Low classification confidence** (< 0.7)
- **Novel classifications** (Novel Anomaly, unusual patterns)
- **Unusual S2/S1 ratios** (< 5 or > 1000)
- **Energy outside WIMP search window** (< 1 keV or > 100 keV)
- **Poor event quality** (< 0.5)
- **Pile-up events** (multiple overlapping interactions)

Each anomaly is assigned:
- **Anomaly Score** (0.0 to 1.0+)
- **Severity Level** (low, medium, high)
- **Detailed Flags** explaining what makes it anomalous

### 🧠 AI-Powered Hypothesis Generation
For each anomalous event, Claude AI generates **THREE detailed hypotheses**:

#### 1. **Most Likely Explanation (60-80% probability)**
- Physical mechanism
- Why this explains the anomaly
- Known precedents from experiments
- Verification methods
- Expected signatures
- Discriminating tests

#### 2. **Alternative Hypothesis (20-40% probability)**
- Different physical interpretation
- Supporting evidence
- How it differs from the most likely explanation
- Verification approach
- Expected signatures
- Tests to distinguish it

#### 3. **Exotic/Novel Physics (5-20% probability)**
- Unusual or unexpected explanation
- Why standard physics might not apply
- Implications if true
- Testing methodology
- Unique signatures to look for
- Critical experiments needed

### 📊 Additional Analysis
For each event, the system also provides:
- **Immediate Actions**: What to check in existing data
- **Data Requirements**: What additional data would help
- **Literature References**: Relevant papers and experiments
- **Recommended Priority**: High, medium, or low

## Usage

### Basic Classification Only
```bash
python mainClassify.py --num-events 10
```

### Classification + Hypothesis Generation
```bash
python mainClassify.py --num-events 20 --generate-hypotheses --top-anomalies 5
```

### Command-Line Arguments
- `--num-events N`: Number of events to classify (default: 10)
- `--generate-hypotheses`: Enable physics hypothesis generation
- `--top-anomalies N`: Number of top anomalies to analyze (default: 10)

## Output Files

### Classification Results
- `dataset/claude_classified_results_detailed.json` - Full classification results

### Hypothesis Generation Results
- `anomaly_analysis/comprehensive_analysis.json` - Summary of all anomalies and hypotheses
- `anomaly_analysis/event_XXXXX_hypotheses.json` - Individual detailed analysis for each anomaly

## Example Output Structure

### Anomaly Identification
```json
{
  "Event_ID": 12345,
  "Classification": "Novel Anomaly",
  "Confidence": 0.45,
  "Anomaly_Score": 0.875,
  "Severity": "high",
  "Flags": [
    {
      "type": "Low Confidence",
      "value": "0.45",
      "severity": "medium"
    },
    {
      "type": "Novel Classification",
      "value": "Novel Anomaly",
      "severity": "high"
    },
    {
      "type": "Unusual S2/S1 Ratio",
      "value": "3.2",
      "severity": "high"
    }
  ]
}
```

### Generated Hypotheses
```json
{
  "event_id": 12345,
  "anomaly_summary": "Event shows extremely low S2/S1 ratio with moderate energy...",
  "hypothesis_1": {
    "name": "Most Likely Explanation",
    "probability": "65%",
    "mechanism": "Quenching effect from high-energy nuclear recoil near detector wall",
    "explanation": "The low S2/S1 ratio combined with position data suggests...",
    "precedents": "Similar events observed in LUX Run 4 near cathode region...",
    "verification": "Cross-correlate with veto system timing and check for multiple scatters",
    "expected_signatures": "Should see increased S1 width and delayed S2 timing...",
    "discriminating_tests": "Analyze drift time consistency and compare with AmBe calibration"
  },
  "hypothesis_2": {
    "name": "Alternative Hypothesis",
    "probability": "25%",
    "mechanism": "Electronic noise or detector artifact",
    ...
  },
  "hypothesis_3": {
    "name": "Exotic/Novel Physics",
    "probability": "10%",
    "mechanism": "Potential low-mass dark matter candidate with unusual interaction",
    ...
  },
  "immediate_actions": [
    "Review veto system data for this event",
    "Check if event occurred during known noise period",
    "Compare with other events in same detector region"
  ],
  "data_requirements": [
    "Higher resolution position reconstruction",
    "Extended time window for multi-scatter search"
  ],
  "literature_references": [
    "XENON1T low-energy analysis (2019)",
    "LUX electronic recoil discrimination paper"
  ],
  "recommended_priority": "high"
}
```

## Example Run

```bash
$ python mainClassify.py --num-events 15 --generate-hypotheses --top-anomalies 3

================================================================================
PHYSICS-BASED HYPOTHESIS GENERATION
================================================================================

🔍 Identifying anomalous events...
✅ Found 7 anomalous events
📊 Analyzing top 3 highest-priority anomalies...

================================================================================
ANOMALY EVENT #1: 4523
Severity: HIGH | Anomaly Score: 0.92
================================================================================

🚩 ANOMALOUS FEATURES:
   • Low Confidence: 0.42 (severity: medium)
   • Novel Classification: Novel Anomaly (severity: high)
   • Unusual S2/S1 Ratio: 2.8 (severity: high)

🤖 Generating physics hypotheses...

✅ HYPOTHESIS SUMMARY:

📌 MOST LIKELY (70%):
   Near-wall nuclear recoil with enhanced quenching

📌 ALTERNATIVE (20%):
   Detector artifact from PMT noise correlation

📌 EXOTIC (10%):
   Potential sub-GeV dark matter candidate

🎯 IMMEDIATE ACTIONS:
   • Review veto system timing
   • Check PMT waveforms for noise patterns
   • Compare with AmBe calibration data

💾 Saved to: anomaly_analysis/event_4523_hypotheses.json
```

## Benefits

✨ **Automated Discovery**: Identifies interesting events automatically  
🔬 **Expert-Level Analysis**: AI generates hypotheses at physicist level  
📚 **Knowledge Integration**: References published experiments and theory  
🎯 **Actionable Insights**: Provides specific follow-up actions  
⚡ **Rapid Screening**: Quickly analyzes large datasets for anomalies  
📊 **Comprehensive Documentation**: All analyses saved for review  

## Technical Details

- **AI Model**: Claude 3 Haiku (claude-3-haiku-20240307)
- **Anomaly Detection**: Multi-factor scoring system
- **Hypothesis Generation**: Structured prompt engineering
- **Output Format**: JSON for easy integration
- **Rate Limiting**: 3-second delay between API calls
- **Error Handling**: Robust JSON parsing with fallbacks

## Requirements

- Python 3.8+
- anthropic package
- pandas, numpy
- dotenv (for API key management)

## API Usage

The hypothesis generation uses the Claude API with a token limit of 3500 tokens per event. At current rates:
- ~10 anomalies = ~35,000 tokens
- Cost: ~$0.01-0.02 per 10 anomalies (check current pricing)

## Notes

- Hypothesis generation is optional (use `--generate-hypotheses` flag)
- Rate limiting prevents API overload (3s between calls)
- All output is saved to `anomaly_analysis/` directory
- Comprehensive summary saved for easy review
- Individual event analyses available for detailed study

## Future Enhancements

- [ ] Integration with webapp for real-time analysis
- [ ] Visualization of hypothesis confidence
- [ ] Automated literature search and citation
- [ ] Multi-event correlation analysis
- [ ] Historical anomaly database
- [ ] Machine learning refinement of anomaly detection

---

**Last Updated**: October 11, 2025  
**Version**: 1.0.0
