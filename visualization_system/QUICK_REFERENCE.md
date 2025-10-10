# 🚀 QUICK REFERENCE - Visualization System

## ⚡ ONE-COMMAND SOLUTION

```bash
cd visualization_system
python run_all.py
```

**This runs everything:** Classify → Visualize → Display → Open Charts!

---

## 📋 Individual Commands

### 1. Classify Events
```bash
python mainClassify.py --num-events 20
```
**Output:** `results/claude_classified_results_detailed.json`

### 2. Generate Charts
```bash
python visualizer.py
```
**Output:** 5 PNG charts in `charts_output/`

### 3. View Results in Terminal
```bash
python show_results.py
```
**Output:** Detailed terminal display with feature importance bars

### 4. Open Charts
```bash
python view_charts.py
```
**Output:** Opens all charts in your default image viewer

---

## 📊 Generated Charts

| File | Description | Key Insights |
|------|-------------|--------------|
| `01_discrimination_bands.png` | S2/S1 vs Energy scatter | **Main physics plot** - shows particle separation |
| `02_class_distribution.png` | Dataset composition bars | Event counts per particle type |
| `03_classification_accuracy.png` | AI performance metrics | Accuracy pie chart + confidence histogram |
| `04_energy_distributions.png` | Energy spectra overlays | Energy ranges by particle type |
| `05_s2s1_distributions.png` | S2/S1 ratio distributions | Linear + log scale with classification bands |

---

## 🎯 Feature Importance Display

When you run `show_results.py`, you'll see:

```
🎯 FEATURE IMPORTANCE SCORES (0-100):
   S2/S1 Ratio     [███████████████████░]  95/100 🟢 HIGH
   Energy          [████████████░░░░░░░░]  60/100 🟡 MEDIUM
   Pulse Shape     [████████░░░░░░░░░░░░]  40/100 🟡 MEDIUM
   Position        [██████░░░░░░░░░░░░░░]  30/100 🔴 LOW
   Drift Time      [██████████░░░░░░░░░░]  50/100 🟡 MEDIUM
```

**Color Guide:**
- 🟢 **GREEN (70-100):** Critical feature for classification
- 🟡 **ORANGE (40-69):** Moderately important
- 🔴 **RED (0-39):** Minor contribution

---

## 🔄 Typical Workflow

### Quick Analysis (5 events, 30 seconds)
```bash
python run_all.py
# Enter: 5 when prompted
```

### Standard Analysis (20 events, 1 minute)
```bash
python run_all.py
# Enter: 20 when prompted
```

### Deep Analysis (50 events, 2 minutes)
```bash
python mainClassify.py --num-events 50
python visualizer.py
python show_results.py
```

---

## 📁 File Structure

```
visualization_system/
├── run_all.py              ← RUN THIS! Complete pipeline
├── mainClassify.py         ← Step 1: Classify events
├── visualizer.py           ← Step 2: Generate charts
├── show_results.py         ← Step 3: Display in terminal
├── view_charts.py          ← Step 4: Open charts
├── results/
│   └── claude_classified_results_detailed.json
└── charts_output/
    ├── 01_discrimination_bands.png
    ├── 02_class_distribution.png
    ├── 03_classification_accuracy.png
    ├── 04_energy_distributions.png
    ├── 05_s2s1_distributions.png
    └── visualization_summary.txt
```

---

## 🎨 What You'll See

### In Terminal:
✅ Classification progress with live updates  
✅ Feature importance scores with visual bars  
✅ AI reasoning for each decision  
✅ Summary statistics (accuracy, confidence)  
✅ Chart generation confirmation  

### In Image Viewer:
✅ 5 publication-quality charts (300 DPI)  
✅ Physics discrimination plot with bands  
✅ Statistical distributions  
✅ Performance metrics  

---

## 💡 Pro Tips

1. **Always run `run_all.py`** for the complete experience
2. **Start with 10 events** to get quick results
3. **Check the bars** in terminal - they show AI's reasoning
4. **Look at 01_discrimination_bands.png first** - it's the key plot
5. **Compare true labels vs predictions** in terminal output

---

## 🚨 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| "API key not configured" | Set in `../.env` |
| "Too Many Requests" | Reduce event count or wait |
| Charts don't open | Check `charts_output/` folder |
| Low accuracy | Normal - some particle types are hard to classify |

---

## 📈 Expected Results

- **Accuracy:** 40-70% (depends on event types)
- **S2/S1 Importance:** Usually 90-100/100 (it's the main feature!)
- **Energy Importance:** Usually 40-60/100
- **Other Features:** Usually 20-50/100

**This is normal!** S2/S1 ratio is the primary discriminator in physics.

---

## 🎯 Quick Commands Reference

```bash
# Complete pipeline (RECOMMENDED)
python run_all.py

# Just classify
python mainClassify.py --num-events 15

# Just show results
python show_results.py

# Just view charts
python view_charts.py

# Read summary report
type charts_output\visualization_summary.txt
```

---

**🌌 Happy Dark Matter Hunting! 🌌**
