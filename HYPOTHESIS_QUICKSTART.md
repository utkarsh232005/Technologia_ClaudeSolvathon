# Physics-Based Hypothesis Generation - Quick Start Guide

## 🚀 Quick Start

### Step 1: Basic Classification
First, classify some events to get initial results:

```bash
python mainClassify.py --num-events 20
```

This will:
- Classify 20 events from your dataset
- Use Claude AI for detailed physics analysis
- Save results to `dataset/claude_classified_results_detailed.json`

### Step 2: Generate Hypotheses for Anomalies
Now run the hypothesis generation:

```bash
python mainClassify.py --num-events 20 --generate-hypotheses --top-anomalies 5
```

This will:
- Analyze the 20 classified events
- Identify anomalous patterns
- Generate 3 detailed hypotheses for the top 5 anomalies
- Save comprehensive analysis to `anomaly_analysis/`

### Step 3: Review Results
Check the generated hypotheses:

```bash
python check_hypothesis_results.py
```

## 📖 Example Workflow

### Scenario: Analyzing a New Dataset

```bash
# Step 1: Classify a larger batch
python mainClassify.py --num-events 50

# Step 2: Generate hypotheses for top 10 anomalies
python mainClassify.py --num-events 50 --generate-hypotheses --top-anomalies 10

# Step 3: Review results
python check_hypothesis_results.py

# Step 4: Check individual event analysis
cat anomaly_analysis/event_12345_hypotheses.json
```

## 📂 Output Structure

```
IIIT Hackathon/
├── mainClassify.py                    # Main script
├── dataset/
│   └── claude_classified_results_detailed.json   # All classifications
├── anomaly_analysis/                  # Created automatically
│   ├── comprehensive_analysis.json    # Summary of all anomalies
│   ├── event_4523_hypotheses.json    # Individual event analysis
│   ├── event_7891_hypotheses.json
│   └── event_9234_hypotheses.json
└── check_hypothesis_results.py        # Quick results viewer
```

## 🎯 Use Cases

### 1. Quick Anomaly Screening
```bash
# Analyze 100 events, get hypotheses for top 3 anomalies
python mainClassify.py --num-events 100 --generate-hypotheses --top-anomalies 3
```

### 2. Deep Dive Analysis
```bash
# Classify fewer events, but analyze more anomalies in detail
python mainClassify.py --num-events 30 --generate-hypotheses --top-anomalies 15
```

### 3. Classification Only (No Hypotheses)
```bash
# Just classify events, skip hypothesis generation
python mainClassify.py --num-events 50
```

## 🔍 What Makes an Event "Anomalous"?

The system flags events as anomalous based on:

1. **Low Confidence** (< 0.7)
   - AI is uncertain about classification
   - Suggests unusual features

2. **Novel Classification**
   - Classified as "Novel Anomaly"
   - Doesn't fit standard patterns

3. **Unusual S2/S1 Ratio**
   - Very low (< 5) or very high (> 1000)
   - Outside expected ranges

4. **Strange Energy**
   - Below 1 keV or above 100 keV
   - Outside WIMP search window

5. **Poor Event Quality** (< 0.5)
   - Potential detector artifacts
   - Noisy signals

6. **Pile-up Events**
   - Multiple overlapping interactions
   - Complex to interpret

## 📊 Understanding the Output

### Anomaly Scores
- **0.0 - 0.3**: Normal event (not flagged)
- **0.3 - 0.5**: Low severity anomaly
- **0.5 - 0.8**: Medium severity anomaly
- **0.8+**: High severity anomaly

### Hypothesis Probabilities
- **Hypothesis 1**: 60-80% probability (most likely)
- **Hypothesis 2**: 20-40% probability (alternative)
- **Hypothesis 3**: 5-20% probability (exotic/novel)

### Priority Levels
- **High**: Requires immediate investigation
- **Medium**: Should be reviewed soon
- **Low**: Interesting but not urgent

## 💡 Tips & Best Practices

### 1. Start Small
```bash
# Test with a few events first
python mainClassify.py --num-events 10 --generate-hypotheses --top-anomalies 3
```

### 2. Balance Quantity vs Quality
- More events = better anomaly detection
- Fewer anomalies = more detailed analysis
- Sweet spot: 20-50 events, 5-10 anomalies

### 3. Review Individual Analyses
```bash
# Each event has its own detailed JSON file
cat anomaly_analysis/event_*_hypotheses.json | jq .
```

### 4. Use the Summary First
```bash
# Start with the comprehensive analysis
cat anomaly_analysis/comprehensive_analysis.json | jq '.anomalies[0]'
```

### 5. Check Rate Limits
- System waits 3 seconds between API calls
- 10 anomalies ≈ 30 seconds
- Plan accordingly for large batches

## 🔧 Troubleshooting

### Issue: No anomalies found
**Solution**: Events may be too normal. Try:
```bash
# Lower the confidence threshold (edit mainClassify.py)
# Or analyze more events
python mainClassify.py --num-events 100 --generate-hypotheses
```

### Issue: API errors
**Solution**: Check your Claude API key:
```bash
# Verify .env file exists and has CLAUDE_API_KEY
cat .env | grep CLAUDE_API_KEY
```

### Issue: JSON parsing errors
**Solution**: The script has built-in fallbacks, but if persistent:
- Check Claude API status
- Try reducing `--top-anomalies` number
- Review error messages in output

## 📈 Performance

### Timing Estimates
- Classification: ~2-3 seconds per event
- Hypothesis generation: ~5-7 seconds per anomaly
- Total for 20 events + 5 anomalies: ~2-3 minutes

### API Costs (Approximate)
- Classification: $0.001 per event
- Hypothesis: $0.003 per anomaly
- 20 events + 5 anomalies ≈ $0.035

## 🎓 Advanced Usage

### Custom Anomaly Detection
Edit `mainClassify.py` to adjust thresholds:
```python
# Line ~278
def identify_anomalies(classified_events, anomaly_threshold=0.3):
    # Change 0.3 to 0.5 for stricter detection
    # Change to 0.2 for more sensitive detection
```

### Analyzing Specific Events
```python
# Create a custom script
import json
from mainClassify import generate_physics_hypotheses

# Load your event
event = {...}  # Your event data

# Generate hypotheses
hypotheses = generate_physics_hypotheses(event)
print(json.dumps(hypotheses, indent=2))
```

## 📚 Next Steps

1. **Integrate with Webapp**
   - Display hypotheses in UI
   - Real-time anomaly detection
   - Interactive hypothesis exploration

2. **Build Database**
   - Store all anomalies
   - Track patterns over time
   - Correlate across runs

3. **Automated Reports**
   - Generate PDF summaries
   - Email alerts for high-priority anomalies
   - Weekly digest of interesting events

## 🤝 Contributing

Want to improve the hypothesis generation?
- Refine the prompts in `generate_physics_hypotheses()`
- Add new anomaly detection criteria
- Enhance the output formatting
- Create visualization tools

---

**Questions?** Check `HYPOTHESIS_GENERATION_README.md` for technical details.

**Last Updated**: October 11, 2025
