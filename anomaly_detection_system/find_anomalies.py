"""Find events that should be flagged as anomalies based on physics rules"""
import pandas as pd

# Load dataset
df = pd.read_csv('../dataset/dark_matter_synthetic_dataset.csv')

# Filter to valid S2/S1 events
df_valid = df[df['s2_over_s1_ratio'].notna()].copy()

print("="*80)
print("SEARCHING FOR PHYSICS ANOMALIES IN DATASET")
print("="*80)
print(f"\nAnalyzing {len(df_valid)} events with valid S2/S1 data\n")

# Find different types of anomalies
extreme_energy_low = df_valid[df_valid['recoil_energy_keV'] < 1.0]
extreme_energy_high = df_valid[df_valid['recoil_energy_keV'] > 40]
extreme_s2s1_low = df_valid[df_valid['s2_over_s1_ratio'] < 1.0]
extreme_s2s1_high = df_valid[df_valid['s2_over_s1_ratio'] > 25]
unusual_drift_low = df_valid[df_valid['drift_time_us'] < 50]
unusual_drift_high = df_valid[df_valid['drift_time_us'] > 800]

print("ANOMALY CANDIDATES:")
print("-"*80)
print(f"Low Energy (< 1.0 keV):           {len(extreme_energy_low):,} events")
print(f"High Energy (> 40 keV):           {len(extreme_energy_high):,} events")
print(f"Low S2/S1 (< 1.0):                {len(extreme_s2s1_low):,} events")
print(f"High S2/S1 (> 25):                {len(extreme_s2s1_high):,} events")
print(f"Short Drift Time (< 50 μs):       {len(unusual_drift_low):,} events")
print(f"Long Drift Time (> 800 μs):       {len(unusual_drift_high):,} events")

# Find first few interesting events
print("\n" + "="*80)
print("SAMPLE ANOMALOUS EVENTS")
print("="*80)

# Get first 5 extreme energy events
if len(extreme_energy_high) > 0:
    print("\nHIGH ENERGY EVENTS (first 5):")
    print("-"*80)
    sample = extreme_energy_high.head(5)
    for idx, event in sample.iterrows():
        print(f"Event {idx}:")
        print(f"  Energy: {event['recoil_energy_keV']:.2f} keV")
        print(f"  S2/S1:  {event['s2_over_s1_ratio']:.2f}")
        print(f"  Label:  {event.get('label', 'Unknown')}")
        print()

# Get first 5 extreme S2/S1 events
if len(extreme_s2s1_low) > 0:
    print("LOW S2/S1 EVENTS (first 5):")
    print("-"*80)
    sample = extreme_s2s1_low.head(5)
    for idx, event in sample.iterrows():
        print(f"Event {idx}:")
        print(f"  Energy: {event['recoil_energy_keV']:.2f} keV")
        print(f"  S2/S1:  {event['s2_over_s1_ratio']:.2f}")
        print(f"  Label:  {event.get('label', 'Unknown')}")
        print()

# Statistics
print("="*80)
print("STATISTICS")
print("="*80)
print(f"\nEnergy Range:     {df_valid['recoil_energy_keV'].min():.2f} - {df_valid['recoil_energy_keV'].max():.2f} keV")
print(f"S2/S1 Range:      {df_valid['s2_over_s1_ratio'].min():.2f} - {df_valid['s2_over_s1_ratio'].max():.2f}")
print(f"Drift Time Range: {df_valid['drift_time_us'].min():.1f} - {df_valid['drift_time_us'].max():.1f} μs")

print("\n" + "="*80)
print("RECOMMENDATION")
print("="*80)
print("\nAdjust detection thresholds in mainAnomalyDetection.py:")
print("- Energy: Flag if < 1.0 or > 40 keV (current: < 0.5 or > 50)")
print("- S2/S1:  Flag if < 1.0 or > 25 (current: < 0.5 or > 50)")
print("- Drift:  Flag if < 50 or > 800 μs (current: < 10 or > 900)")
print("="*80)
