# Anomaly Detection Results

This directory contains the output files from anomaly detection runs:

## Files Generated

- **detected_anomalies_detailed.csv** - Spreadsheet format with all detected anomalies
- **detected_anomalies_detailed.json** - JSON format for programmatic access

## Column Descriptions

### detected_anomalies_detailed.csv

| Column | Type | Description |
|--------|------|-------------|
| Event_ID | int | Unique event identifier from dataset |
| Anomaly_Score | float | Overall anomaly score (0.0 to 1.0) |
| Severity | string | Critical / High / Medium |
| Num_Flags | int | Number of anomaly flags triggered |
| Energy_keV | float | Recoil energy in keV |
| S2_S1_Ratio | float | S2/S1 discrimination ratio |
| Position_X | float | X position in cm |
| Position_Y | float | Y position in cm |
| Drift_Time_us | float | Electron drift time in microseconds |
| AI_Classification | string | Classification from Claude AI |
| AI_Confidence | float | Confidence score from Claude (0.0-1.0) |
| AI_Reasoning | string | Explanation from Claude |
| Flags_Detail | JSON string | Detailed flag information |

## Usage

```python
import pandas as pd

# Load results
anomalies = pd.read_csv('detected_anomalies_detailed.csv')

# View top anomalies
print(anomalies.head(10))

# Filter by severity
critical = anomalies[anomalies['Severity'] == 'Critical']
print(f"Critical anomalies: {len(critical)}")

# Analyze by score
high_score = anomalies[anomalies['Anomaly_Score'] > 0.7]
```

Results are sorted by Anomaly_Score (descending) by default.
