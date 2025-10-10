# 🎯 COMPLETE GUIDE: How to Use the Visualization System

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [First Time Setup](#first-time-setup)
3. [Usage Scenarios](#usage-scenarios)
4. [Understanding the Charts](#understanding-the-charts)
5. [Advanced Tips](#advanced-tips)

---

## Prerequisites ✅

Before starting, make sure you have:

- [x] Python 3.11+ installed
- [x] All dependencies installed: `pip install -r requirements.txt`
- [x] Dataset generated: 50,000 events in `../dataset/dark_matter_synthetic_dataset.csv`
- [x] Gemini API key from: https://makersuite.google.com/app/apikey

---

## First Time Setup

### Step 1: Set Your API Key

1. Open `../.env` file (in project root)
2. Find this line:
   ```properties
   GEMINI_API_KEY="API KEY HERE"
   ```
3. Replace with your actual key:
   ```properties
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
   ```
4. Save the file

### Step 2: Verify Installation

```bash
cd visualization_system
python --version  # Should show 3.11+
pip list | grep -E "matplotlib|pandas|numpy"  # Check packages
```

---

## Usage Scenarios

### Scenario 1: "I just want to see the charts!" 🚀

**Goal:** Generate visualizations using existing data  
**Time:** 5 seconds

```bash
cd visualization_system
python visualizer.py
```

**What you get:**
- 5 publication-quality charts
- Summary statistics report
- Uses existing classification results (if any)

**When to use:** Daily quick analysis, checking dataset quality

---

### Scenario 2: "I want to classify events and see results" 🔬

**Goal:** Full analysis with AI classification + visualization  
**Time:** ~1 minute for 20 events

```bash
cd visualization_system

# Classify 20 events with feature importance
python mainClassify.py --num-events 20

# Generate all visualizations
python visualizer.py
```

**What you get:**
- Classification results with feature importance scores
- 5 main charts
- 20 individual feature importance charts
- Complete summary report

**When to use:** Research analysis, understanding AI decisions

---

### Scenario 3: "I want detailed explanations AND charts" 📚

**Goal:** Use both classification systems for maximum insight  
**Time:** ~2 minutes for 10 events

```bash
# First: Get detailed 7-section explanations
cd classification_system
python enhanced_classifier.py --num-events 10

# Second: Get feature importance analysis
cd ../visualization_system
python mainClassify.py --num-events 10

# Third: Create visualizations
python visualizer.py
```

**What you get:**
- Detailed markdown explanations (7 sections per event)
- Feature importance scores
- All visualization charts
- Two complementary perspectives on same events

**When to use:** Deep research, publications, presentations

---

### Scenario 4: "I want to analyze specific event types" 🎯

**Goal:** Focus on particular particle types  
**Time:** Variable

```bash
cd visualization_system

# Modify mainClassify.py to sample specific types
# Then run as usual
python mainClassify.py --num-events 30
python visualizer.py
```

**How to modify mainClassify.py:**
```python
# Around line 220, modify sampling logic:
# Instead of balanced sampling, do:
events = df[df['label'] == 'WIMP-like'].sample(n=30)
```

**When to use:** Focused analysis on specific signals

---

## Understanding the Charts

### Chart 1: Discrimination Bands 🎨
**File:** `01_discrimination_bands.png`

```
┌─────────────────────────────────────────┐
│ Log₁₀(S2/S1) vs Energy Scatter Plot    │
│                                         │
│ High S2/S1 ═══════ Background (ER)     │
│            ─────── WIMP Region          │
│ Low S2/S1  ─ ─ ─ ─ Axion Region        │
└─────────────────────────────────────────┘
```

**What to look for:**
- ✅ **Good separation**: Different particle types cluster in different regions
- ✅ **Clear bands**: Classification boundaries align with physics
- ⚠️ **Overlap**: Some events near boundaries (expected, physics is messy!)

**Physics Interpretation:**
- **High S2/S1 (>5)**: Electronic recoils → Background radiation
- **Medium S2/S1 (2-4)**: Nuclear recoils → Potential WIMP signals
- **Low S2/S1 (<2)**: Exotic signatures → Axion-like or novel physics

---

### Chart 2: Class Distribution 📊
**File:** `02_class_distribution.png`

```
Background     ████████████ 92.9%
WIMP-like      ██ 4.1%
Axion-like     █ 1.5%
Novel-Anomaly  █ 1.0%
Sterile-ν      ▌ 0.5%
```

**What to look for:**
- ✅ **Background dominance**: Realistic (most events are background)
- ✅ **Signal rarity**: WIMP/Axion events are rare (as in real experiments)

**Why it matters:**
- Shows dataset realism
- Explains why high accuracy on background is expected
- Highlights importance of signal sensitivity

---

### Chart 3: Classification Accuracy 🎯
**File:** `03_classification_accuracy.png`

```
┌──────────────┬──────────────┐
│  Correct vs  │ Confidence   │
│  Incorrect   │ Distribution │
│  (Pie Chart) │ (Histogram)  │
└──────────────┴──────────────┘
```

**What to look for:**
- ✅ **High accuracy** (>90%): Good classifier performance
- ✅ **High confidence** mean (>0.7): AI is reasonably certain
- ⚠️ **Low confidence** on some events: These need human review

**Red flags:**
- ❌ Accuracy <70%: Check classification logic
- ❌ Very low confidence (<0.5) but high accuracy: Overfitting?

---

### Chart 4: Energy Distributions 📈
**File:** `04_energy_distributions.png`

```
Number of Events
    ▲
    │  ╱╲        Background
    │ ╱  ╲╱╲     WIMP-like
    │╱    ╲  ╲   Axion-like
    └──────────► Energy (keV)
```

**What to look for:**
- ✅ **Different peaks**: Each particle type has characteristic energy range
- ✅ **Overlap**: Expected (physics isn't perfectly separable)

**Physics Check:**
- Background: Should span wide energy range
- WIMP-like: Typically 1-50 keV (nuclear recoils)
- Axion-like: Lower energies, different spectrum shape

---

### Chart 5: S2/S1 Distributions 📉
**File:** `05_s2s1_distributions.png`

```
Linear Scale:    Shows raw discrimination
Log Scale:       Shows subtle differences better

Classification bands marked:
  │ Axion │ WIMP │    Background    │
  └───────┴──────┴──────────────────┘
```

**What to look for:**
- ✅ **Clear separation** between particle types
- ✅ **Band markers** align with data peaks
- ✅ **Log scale** reveals low-S2/S1 details

**This is THE key discrimination plot!**

---

### Chart 6: Feature Importance (Individual Events) 🔍
**File:** `06_importance_event_X.png`

```
S2/S1 Ratio   ████████████████ 95/100
Energy        ████████████ 75/100
Pulse Shape   █████████ 65/100
Position      ██████ 45/100
Drift Time    ████ 30/100
```

**Color Code:**
- 🟢 **Green (70-100)**: Critical feature for this classification
- 🟡 **Orange (40-69)**: Moderately important
- 🔴 **Red (0-39)**: Minor contribution

**What to look for:**
- ✅ **S2/S1 dominance**: Should be highest for most events (it's the main discriminator)
- ✅ **Energy importance**: Should be high for WIMP/Axion separation
- ⚠️ **Unexpected patterns**: If "Position" is always high, investigate why

**Use Case:** Verify AI is using physics correctly, not learning spurious correlations

---

## Advanced Tips

### Tip 1: Batch Processing 🔄

Process events in batches to avoid API rate limits:

```bash
# Process 100 events in batches of 20
for i in {1..5}; do
  python mainClassify.py --num-events 20
  sleep 10  # Cool-down between batches
done

python visualizer.py  # Visualize all results
```

---

### Tip 2: Compare Classification Systems 🔬

```bash
# Run both systems on same events
cd classification_system
python enhanced_classifier.py --num-events 10

cd ../visualization_system  
python mainClassify.py --num-events 10

# Then compare:
# - classification_system: Detailed physics explanations
# - visualization_system: Feature importance scores
# - Look for consistency in classifications!
```

---

### Tip 3: Custom Analysis 🎨

Modify `visualizer.py` to create custom plots:

```python
# Add after plot_s2s1_distributions():

def plot_custom_analysis(df):
    """Your custom visualization"""
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # Your analysis here
    # Example: Position distribution
    wimp_events = df[df['label'] == 'WIMP-like']
    ax.scatter(wimp_events['position_x_mm'], 
               wimp_events['position_y_mm'])
    
    plt.savefig('charts_output/custom_plot.png', dpi=300)
    plt.close()
```

---

### Tip 4: Publication Export 📄

For papers/presentations:

```bash
# Generate high-res charts
# Edit visualizer.py: change dpi=300 to dpi=600

python visualizer.py

# Charts are now 600 DPI (publication quality)
# Import into LaTeX, PowerPoint, etc.
```

---

### Tip 5: Automated Reporting 📧

Create a script to auto-generate and email reports:

```bash
#!/bin/bash
# auto_report.sh

cd visualization_system
python mainClassify.py --num-events 50
python visualizer.py

# Email the summary
cat charts_output/visualization_summary.txt | mail -s "Daily Analysis" you@example.com
```

---

## Quick Reference Card 🃏

| Task | Command | Time |
|------|---------|------|
| Quick viz | `python visualizer.py` | 5s |
| Classify 10 | `python mainClassify.py --num-events 10` | 20s |
| Full analysis (20) | `mainClassify.py + visualizer.py` | 45s |
| Detailed + viz | `enhanced_classifier.py + mainClassify.py + visualizer.py` | 2m |

---

## Troubleshooting Matrix 🔧

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| "API key not configured" | No key in .env | Set `GEMINI_API_KEY` in `../.env` |
| "Dataset not found" | No dataset | Run `python ../main.py` |
| Charts look wrong | Wrong bands | Check S2S1 constants match physics |
| Low accuracy (<70%) | Bad classification | Review band definitions |
| Missing feature charts | Used wrong script | Use `mainClassify.py`, not `enhanced_classifier.py` |
| API 404 errors | Wrong model | Check model is `gemini-2.0-flash-exp` |

---

## Next Steps 🚀

1. **Run your first analysis:**
   ```bash
   python mainClassify.py --num-events 10
   python visualizer.py
   ```

2. **Explore the charts** in `charts_output/`

3. **Read the summary** in `visualization_summary.txt`

4. **Experiment** with different event counts

5. **Compare** with `classification_system` results

6. **Customize** colors, bands, or add custom plots

---

**You're ready to visualize dark matter! 🌌📊**

*For questions, check:*
- `README.md` - Full documentation
- `QUICKSTART.md` - Step-by-step guide
- `COMPLETE_SETUP.md` - System overview
