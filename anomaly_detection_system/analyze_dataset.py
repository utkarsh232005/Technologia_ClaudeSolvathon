"""Quick dataset analysis to understand S2/S1 data availability."""
import pandas as pd

# Load dataset
df = pd.read_csv('../dataset/dark_matter_synthetic_dataset.csv')

print("="*80)
print("DATASET ANALYSIS")
print("="*80)
print(f"\nTotal events: {len(df)}")
print(f"\nS2/S1 Ratio Statistics:")
print(f"  Valid S2/S1:   {df['s2_over_s1_ratio'].notna().sum():,} ({df['s2_over_s1_ratio'].notna().sum()/len(df)*100:.1f}%)")
print(f"  Missing S2/S1: {df['s2_over_s1_ratio'].isna().sum():,} ({df['s2_over_s1_ratio'].isna().sum()/len(df)*100:.1f}%)")

# Get events with valid S2/S1
valid_df = df[df['s2_over_s1_ratio'].notna()]

if len(valid_df) > 0:
    print(f"\nS2/S1 Range (valid events only):")
    print(f"  Min:    {valid_df['s2_over_s1_ratio'].min():.2f}")
    print(f"  Max:    {valid_df['s2_over_s1_ratio'].max():.2f}")
    print(f"  Mean:   {valid_df['s2_over_s1_ratio'].mean():.2f}")
    print(f"  Median: {valid_df['s2_over_s1_ratio'].median():.2f}")
    
    print(f"\nEnergy Range:")
    print(f"  Min:    {df['recoil_energy_keV'].min():.3f} keV")
    print(f"  Max:    {df['recoil_energy_keV'].max():.3f} keV")
    print(f"  Mean:   {df['recoil_energy_keV'].mean():.3f} keV")
    
    print(f"\nPotential Physics Anomalies (in valid events):")
    extreme_s2s1 = valid_df[(valid_df['s2_over_s1_ratio'] > 50) | (valid_df['s2_over_s1_ratio'] < 0.5)]
    extreme_energy = valid_df[(valid_df['recoil_energy_keV'] > 50) | (valid_df['recoil_energy_keV'] < 0.5)]
    edge_events = valid_df[(valid_df['position_x_mm'].abs() > 40) | (valid_df['position_y_mm'].abs() > 40)]
    
    print(f"  Extreme S2/S1 (>50 or <0.5):     {len(extreme_s2s1):,}")
    print(f"  Extreme Energy (>50 or <0.5):    {len(extreme_energy):,}")
    print(f"  Edge Events (|pos| > 40):        {len(edge_events):,}")

print("\n" + "="*80)
print("RECOMMENDATION")
print("="*80)
print("\nTo find physics anomalies, you should:")
print("1. Run analysis on events WITH valid S2/S1 data")
print("2. Use: python mainAnomalyDetection.py --num-events 1000")
print("3. This will skip the NaN events and focus on real physics signals")
print("="*80)
