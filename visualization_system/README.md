# Dark Matter Event Visualization System 📊

**Integrated visualization suite for dark matter detector event analysis**

This system creates comprehensive visual analysis of the dark matter detection dataset and classification results, perfectly synchronized with the `classification_system`.

---

## 🎯 Features

### Generated Visualizations

1. **Discrimination Bands Plot** (`01_discrimination_bands.png`)
   - S2/S1 vs Energy scatter plot
   - Physics-based classification regions (Background, WIMP, Axion)
   - Matches enhanced classifier logic exactly

2. **Class Distribution** (`02_class_distribution.png`)
   - Bar chart showing dataset composition
   - Event counts and percentages for each particle type

3. **Classification Accuracy** (`03_classification_accuracy.png`)
   - Pie chart: Correct vs Incorrect classifications
   - Histogram: Confidence score distribution
   - Overall accuracy metrics

4. **Energy Distributions** (`04_energy_distributions.png`)
   - Overlapping histograms for each particle type
   - Recoil energy spectra analysis

5. **S2/S1 Ratio Distributions** (`05_s2s1_distributions.png`)
   - Linear and Log₁₀ scale distributions
   - Classification band markers
   - Discrimination power visualization

6. **Feature Importance Charts** (individual event analysis)
   - Bar charts showing which features drove each classification
   - Generated for each classified event

---

## 🚀 Quick Start

### Step 1: Ensure Dataset Exists
```bash
# From project root
python main.py
```

### Step 2: Run Classification with Feature Importance
```bash
cd visualization_system
python mainClassify.py --num-events 20
```

**What this does:**
- Classifies 20 events using Gemini API
- Generates feature importance scores (0-100) for each event
- Saves results to `results/claude_classified_results_detailed.json`
- Creates data ready for visualization

### Step 3: Generate Visualizations
```bash
python visualizer.py
```

**What this does:**
- Creates all 5 main visualization charts
- Generates feature importance charts for each classified event
- Saves everything to `charts_output/`
- Creates `visualization_summary.txt` report

---

## 📁 Directory Structure

```
visualization_system/
├── mainClassify.py              # Classify events with importance scores
├── visualizer.py                # Generate all visualizations
├── README.md                    # This file
├── results/                     # Classification results
│   └── claude_classified_results_detailed.json
└── charts_output/               # All generated charts
    ├── 01_discrimination_bands.png
    ├── 02_class_distribution.png
    ├── 03_classification_accuracy.png
    ├── 04_energy_distributions.png
    ├── 05_s2s1_distributions.png
    ├── 03_importance_chart_*.png (per event)
    └── visualization_summary.txt
```

---

## 🔧 Configuration

### API Key Setup
Make sure your Gemini API key is set in `../.env`:

```properties
GEMINI_API_KEY=your_actual_api_key_here
```

Get your key from: https://makersuite.google.com/app/apikey

### Classification Bands
Defined in both systems to match perfectly:

| Band | S2/S1 Range | Particle Type |
|------|-------------|---------------|
| Axion | < 2.0 | Exotic Electron Recoil |
| WIMP | 2.0 - 4.0 | Nuclear Recoil |
| Background | > 5.0 | Electronic Recoil |

---

## 📊 Output Details

### Main Charts
- **Resolution:** 300 DPI (publication quality)
- **Format:** PNG with transparency support
- **Color Scheme:** Matches classification_system perfectly
- **Size:** Optimized for presentations and reports

### Feature Importance Charts
Each classified event gets an individual chart showing:
- S2/S1 Ratio importance (0-100)
- Energy importance (0-100)
- Pulse Shape importance (0-100)
- Position importance (0-100)
- Drift Time importance (0-100)

### Summary Report
Text file with:
- Dataset statistics
- Class distribution breakdown
- Feature statistics (mean, median, std)
- Classification accuracy metrics
- Confidence score analysis

---

## 🔄 Integration with Classification System

This visualization system is designed to work seamlessly with `../classification_system/`:

| Classification System | Visualization System |
|----------------------|---------------------|
| `enhanced_classifier.py` | Uses same dataset |
| Classification bands | Identical band definitions |
| Results JSON | Compatible format |
| Simple explanations | Feature importance scores |

**Can use either system's results for visualization!**

---

## 💡 Usage Examples

### Classify 50 events and visualize
```bash
python mainClassify.py --num-events 50
python visualizer.py
```

### Visualize existing classification_system results
```bash
# Just run visualizer - it will use classification_system results if available
python visualizer.py
```

### Generate only specific charts
Edit `visualizer.py` and comment out unwanted plot functions in `main()`.

---

## 🎨 Customization

### Change Color Scheme
Edit color dictionaries in `visualizer.py`:
```python
label_colors = {
    'Background': '#FF5733',      # Your color here
    'WIMP-like': '#00BFFF',
    # ...
}
```

### Adjust Classification Bands
Modify constants at top of `visualizer.py` and `mainClassify.py`:
```python
S2S1_AXION_MAX = 2.0
S2S1_WIMP_MAX = 4.0
S2S1_BACKGROUND_MIN = 5.0
```

### Change Chart Resolution
In each plot function:
```python
plt.savefig(output_path, dpi=300)  # Change DPI here
```

---

## 📝 Requirements

- Python 3.11+
- pandas
- numpy
- matplotlib
- requests
- python-dotenv

Install from project root:
```bash
pip install -r requirements.txt
```

---

## 🔍 Troubleshooting

### "Dataset not found"
**Solution:** Run `python ../main.py` from project root to generate dataset

### "GEMINI_API_KEY not configured"
**Solution:** Set your API key in `../.env` file

### "No classification results found"
**Solution:** Run `python mainClassify.py --num-events 10` first

### Charts look cramped
**Solution:** Increase figure size in plot functions (e.g., `figsize=(16, 10)`)

### API rate limiting errors
**Solution:** Increase sleep time in `mainClassify.py` (currently 1.5 seconds)

---

## 🎯 Best Practices

1. **Always generate fresh classifications** before visualizing if you want importance scores
2. **Use 20-50 events** for balanced feature importance analysis
3. **Check visualization_summary.txt** for data quality metrics
4. **Compare with classification_system results** to verify consistency
5. **Export charts at 300 DPI** for publication quality

---

## 🔗 Related Files

- `../classification_system/enhanced_classifier.py` - Main classifier with detailed explanations
- `../dataset/dark_matter_synthetic_dataset.csv` - Source dataset
- `../.env` - API key configuration
- `../main.py` - Dataset generator

---

## 📈 Performance

- **Classification:** ~2 seconds per event (Gemini API call)
- **Visualization:** ~5 seconds total for all main charts
- **Memory:** <500MB for 50,000 event dataset
- **Storage:** ~2MB per 10 classified events + charts

---

## ✨ Tips

- Run visualizer after every classification batch to track progress
- Use the discrimination bands plot to verify physics consistency
- Feature importance charts help understand AI decision-making
- Compare true labels vs predictions in accuracy chart
- Summary report is great for quick dataset overview

---

**Made with ❤️ for Dark Matter Research**
