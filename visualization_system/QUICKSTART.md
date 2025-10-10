# Visualization System - Quick Start Guide

## ⚡ Complete Setup in 3 Steps

### Step 1: Configure API Key
```bash
# Open the .env file in project root
# Replace "API KEY HERE" with your actual Gemini API key
# Get key from: https://makersuite.google.com/app/apikey
```

Example `.env` content:
```properties
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

---

### Step 2: Run Classification with Feature Importance
```bash
cd visualization_system
python mainClassify.py --num-events 20
```

**Expected Output:**
```
################################################################################
DARK MATTER EVENT CLASSIFICATION WITH FEATURE IMPORTANCE
For Visualization System
################################################################################

Loading dataset from: ../dataset/dark_matter_synthetic_dataset.csv
✓ Loaded 50,000 events

================================================================================
PROCESSING 20 EVENTS FOR VISUALIZATION
================================================================================

[1/20] Event 1 (True: WIMP-like)
────────────────────────────────────────────────────────────────────────────────
  ⏳ Analyzing event...
  ✓ Classification: WIMP-like (NR)
  ✓ Confidence: 95.00%
  ✓ Feature Importance Scores:
      - S2/S1 Ratio:  95/100
      - Energy:       80/100
      - Pulse Shape:  65/100
      - Position:     45/100
      - Drift Time:   40/100
...
```

**This creates:** `results/claude_classified_results_detailed.json`

---

### Step 3: Generate All Visualizations
```bash
python visualizer.py
```

**Expected Output:**
```
################################################################################
DARK MATTER EVENT VISUALIZATION SYSTEM
Integrated with Enhanced Classification System
################################################################################

================================================================================
LOADING DATA
================================================================================

✓ Loaded dataset: 50,000 events from ../dataset/dark_matter_synthetic_dataset.csv
✓ Calculated log10(S2/S1) ratios
✓ Loaded classification results: 20 analyzed events

================================================================================
GENERATING VISUALIZATIONS
================================================================================

[1/5] Generating Physics Discrimination Bands Plot...
  ✓ Saved: charts_output\01_discrimination_bands.png

[2/5] Generating Class Distribution Plot...
  ✓ Saved: charts_output\02_class_distribution.png

[3/5] Generating Classification Accuracy Analysis...
  ✓ Saved: charts_output\03_classification_accuracy.png
  ℹ Accuracy: 95.0% (19/20 correct)

[4/5] Generating Energy Distribution Plot...
  ✓ Saved: charts_output\04_energy_distributions.png

[5/5] Generating S2/S1 Ratio Distribution Plot...
  ✓ Saved: charts_output\05_s2s1_distributions.png

================================================================================
✓ VISUALIZATION PIPELINE COMPLETE!
================================================================================

All charts saved in: D:\Technologia_ClaudeSolvathon\visualization_system\charts_output

Generated files:
  1. 01_discrimination_bands.png - Main physics discrimination plot
  2. 02_class_distribution.png - Dataset composition
  3. 03_classification_accuracy.png - AI classifier performance
  4. 04_energy_distributions.png - Energy spectra by particle type
  5. 05_s2s1_distributions.png - S2/S1 discrimination analysis
  6. visualization_summary.txt - Detailed statistics report
```

---

## 📊 What Gets Generated

### Main Charts (5 files)
1. **01_discrimination_bands.png** - The most important plot!
   - Shows S2/S1 vs Energy scatter plot
   - Color-coded by particle type
   - Classification bands overlaid
   - Matches classifier logic exactly

2. **02_class_distribution.png**
   - Bar chart of dataset composition
   - Shows event counts and percentages

3. **03_classification_accuracy.png**
   - Pie chart: Correct vs Incorrect
   - Histogram: Confidence distribution
   - Accuracy metrics

4. **04_energy_distributions.png**
   - Energy spectra for each particle type
   - Overlapping histograms

5. **05_s2s1_distributions.png**
   - Linear and Log scale S2/S1 distributions
   - Shows discrimination power

### Summary Report
- `visualization_summary.txt` - Complete statistics

---

## 🔧 Common Workflows

### Workflow 1: Quick Test (5 events)
```bash
python mainClassify.py --num-events 5
python visualizer.py
```
**Time:** ~15 seconds total

---

### Workflow 2: Standard Analysis (20 events)
```bash
python mainClassify.py --num-events 20
python visualizer.py
```
**Time:** ~45 seconds total

---

### Workflow 3: Comprehensive Analysis (50 events)
```bash
python mainClassify.py --num-events 50
python visualizer.py
```
**Time:** ~2 minutes total

---

### Workflow 4: Visualize Existing Classification Results
```bash
# If you already ran ../classification_system/enhanced_classifier.py
python visualizer.py
```
**Time:** ~5 seconds (no classification needed)

---

## 🎯 Integration Points

### Uses These Files (from project):
- `../dataset/dark_matter_synthetic_dataset.csv` - Source data
- `../.env` - API key configuration
- `../classification_system/results/classification_results.json` - Compatible results

### Creates These Files:
- `results/claude_classified_results_detailed.json` - Classification with importance
- `charts_output/*.png` - All visualization charts
- `charts_output/visualization_summary.txt` - Statistics report

---

## 🚨 Troubleshooting

### Problem: "GEMINI_API_KEY not configured"
**Solution:**
1. Open `../.env` in text editor
2. Replace `API KEY HERE` with your actual key
3. Save file
4. Run again

---

### Problem: "Dataset not found"
**Solution:**
```bash
cd ..
python main.py
cd visualization_system
```

---

### Problem: "No classification results found"
**Solution:**
```bash
# Run classification first
python mainClassify.py --num-events 10
# Then run visualizer
python visualizer.py
```

---

### Problem: Charts look different from classification_system
**Check:** Both use same bands:
- Axion: S2/S1 < 2.0
- WIMP: S2/S1 = 2.0-4.0
- Background: S2/S1 > 5.0

If different, check for code modifications.

---

## 💡 Pro Tips

1. **Always visualize after classification** to see what the AI saw
2. **Use 20-50 events** for good statistics without long wait
3. **Check visualization_summary.txt** for quick data overview
4. **Compare charts with classification_system explanations** for consistency
5. **Feature importance shows AI reasoning** - verify it makes physics sense

---

## 📋 File Checklist

Before running, ensure these exist:

- [ ] `../.env` (with valid API key)
- [ ] `../dataset/dark_matter_synthetic_dataset.csv` (50,000 events)
- [ ] `mainClassify.py` (this folder)
- [ ] `visualizer.py` (this folder)
- [ ] matplotlib installed (`pip install matplotlib`)

After running, you'll have:

- [ ] `results/claude_classified_results_detailed.json`
- [ ] `charts_output/01_discrimination_bands.png`
- [ ] `charts_output/02_class_distribution.png`
- [ ] `charts_output/03_classification_accuracy.png`
- [ ] `charts_output/04_energy_distributions.png`
- [ ] `charts_output/05_s2s1_distributions.png`
- [ ] `charts_output/visualization_summary.txt`

---

## 🎨 Customization Quick Reference

### Change number of events to classify:
```bash
python mainClassify.py --num-events 30
```

### Change chart resolution (edit visualizer.py):
```python
plt.savefig(output_path, dpi=600)  # Higher quality
```

### Change colors (edit visualizer.py):
```python
label_colors = {
    'Background': '#YOUR_COLOR',
    # ...
}
```

---

## ⚡ Performance Guide

| Events | Classification Time | Visualization Time | Total |
|--------|--------------------|--------------------|-------|
| 5      | ~10s               | ~5s                | ~15s  |
| 10     | ~20s               | ~5s                | ~25s  |
| 20     | ~40s               | ~5s                | ~45s  |
| 50     | ~100s              | ~5s                | ~105s |

*Times include API calls to Gemini (rate limited to 1.5s between events)*

---

**Ready to visualize dark matter! 🌌**
