import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def generate_event(event_type, detector_depth_m=1400):
    """Generates a single particle event with realistic detector features."""
    
    event = {}
    
    # Common detector parameters
    detector_radius_mm = 500  # Typical xenon detector size
    detector_height_mm = 1000
    drift_velocity_mm_us = 1.33  # Typical for liquid xenon
    
    if event_type == 'background_ER':
        # Electronic Recoils (ER) - High S2/S1 ratio from gamma rays, beta particles
        event['recoil_energy_keV'] = np.random.exponential(scale=5.0)  # Exponential energy spectrum
        event['recoil_energy_keV'] = np.clip(event['recoil_energy_keV'], 1, 100)
        
        # S1 signal (prompt light)
        event['s1_light_yield'] = event['recoil_energy_keV'] * np.random.normal(2.5, 0.3)  # ~2.5 PE/keV for ER
        event['s1_light_yield'] = np.clip(event['s1_light_yield'], 1, None)
        
        # S2 signal (delayed charge) - much larger for ER
        charge_yield = event['recoil_energy_keV'] * np.random.normal(50, 10)  # ~50 electrons/keV
        gas_gain = np.random.normal(25, 3)  # Amplification in gas phase
        event['s2_charge_yield'] = charge_yield * gas_gain
        event['s2_charge_yield'] = np.clip(event['s2_charge_yield'], 10, None)
        
        event['interaction_type'] = 'electronic_recoil'
        event['particle_source'] = np.random.choice(['gamma_ray', 'beta_decay', 'cosmic_muon'], 
                                                   p=[0.6, 0.3, 0.1])
        event['label'] = 'Background'

    elif event_type == 'wimp_NR':
        # WIMP-like Nuclear Recoils (NR) - Low S2/S1 ratio, low energy
        # WIMPs expected to have exponential spectrum with cutoff
        event['recoil_energy_keV'] = np.random.exponential(scale=8.0)
        event['recoil_energy_keV'] = np.clip(event['recoil_energy_keV'], 5, 50)
        
        # Nuclear recoils have much lower light yield
        event['s1_light_yield'] = event['recoil_energy_keV'] * np.random.normal(0.1, 0.02)  # ~0.1 PE/keV for NR
        event['s1_light_yield'] = np.clip(event['s1_light_yield'], 0.1, None)
        
        # S2 signal is also reduced for nuclear recoils
        charge_yield = event['recoil_energy_keV'] * np.random.normal(2, 0.5)  # ~2 electrons/keV
        gas_gain = np.random.normal(25, 3)
        event['s2_charge_yield'] = charge_yield * gas_gain
        event['s2_charge_yield'] = np.clip(event['s2_charge_yield'], 1, None)
        
        event['interaction_type'] = 'nuclear_recoil'
        event['particle_source'] = 'WIMP'
        event['wimp_mass_GeV'] = np.random.uniform(10, 1000)  # WIMP mass hypothesis
        event['label'] = 'WIMP-like'
        
    elif event_type == 'axion-like':
        # Axions convert to photons - appears as monoenergetic gamma peak
        event['recoil_energy_keV'] = np.random.normal(loc=14.4, scale=0.1)  # Sharp peak at 14.4 keV
        event['recoil_energy_keV'] = np.clip(event['recoil_energy_keV'], 13, 16)
        
        # Behaves like electronic recoil but at specific energy
        event['s1_light_yield'] = event['recoil_energy_keV'] * np.random.normal(2.5, 0.3)
        event['s1_light_yield'] = np.clip(event['s1_light_yield'], 1, None)
        
        charge_yield = event['recoil_energy_keV'] * np.random.normal(50, 5)
        gas_gain = np.random.normal(25, 3)
        event['s2_charge_yield'] = charge_yield * gas_gain
        event['s2_charge_yield'] = np.clip(event['s2_charge_yield'], 10, None)
        
        event['interaction_type'] = 'axion_conversion'
        event['particle_source'] = 'solar_axion'
        event['label'] = 'Axion-like'
        
    elif event_type == 'sterile_neutrino':
        # Sterile neutrinos - similar to axions but different energy spectrum
        event['recoil_energy_keV'] = np.random.normal(loc=3.5, scale=0.2)  # Different energy peak
        event['recoil_energy_keV'] = np.clip(event['recoil_energy_keV'], 2, 6)
        
        event['s1_light_yield'] = event['recoil_energy_keV'] * np.random.normal(2.5, 0.3)
        event['s1_light_yield'] = np.clip(event['s1_light_yield'], 1, None)
        
        charge_yield = event['recoil_energy_keV'] * np.random.normal(50, 5)
        gas_gain = np.random.normal(25, 3)
        event['s2_charge_yield'] = charge_yield * gas_gain
        
        event['interaction_type'] = 'sterile_neutrino_decay'
        event['particle_source'] = 'sterile_neutrino'
        event['label'] = 'Sterile-Neutrino'
        
    elif event_type == 'primordial_BH':
        # Primordial black hole evaporation - very high energy signature
        event['recoil_energy_keV'] = np.random.gamma(shape=2, scale=15)  # Higher energy events
        event['recoil_energy_keV'] = np.clip(event['recoil_energy_keV'], 10, 200)
        
        # Mixed signature - could be multiple particles
        event['s1_light_yield'] = event['recoil_energy_keV'] * np.random.normal(1.5, 0.4)
        event['s1_light_yield'] = np.clip(event['s1_light_yield'], 1, None)
        
        charge_yield = event['recoil_energy_keV'] * np.random.normal(30, 8)
        gas_gain = np.random.normal(25, 3)
        event['s2_charge_yield'] = charge_yield * gas_gain
        
        event['interaction_type'] = 'black_hole_evaporation'
        event['particle_source'] = 'primordial_black_hole'
        event['label'] = 'Primordial-BH'

    # Add realistic detector position (cylindrical coordinates)
    # Uniform distribution in volume
    r_max = detector_radius_mm
    theta = np.random.uniform(0, 2*np.pi)
    r = r_max * np.sqrt(np.random.uniform(0, 1))  # Uniform in area
    
    event['position_x_mm'] = r * np.cos(theta)
    event['position_y_mm'] = r * np.sin(theta)
    event['position_z_mm'] = np.random.uniform(-detector_height_mm/2, detector_height_mm/2)
    
    # Calculate drift time from Z position
    drift_distance = abs(event['position_z_mm'] + detector_height_mm/2)
    event['drift_time_us'] = drift_distance / drift_velocity_mm_us
    
    # Add detector response features
    event['s1_width_ns'] = np.random.normal(50, 10)  # S1 pulse width
    event['s2_width_us'] = np.random.normal(2.5, 0.5)  # S2 pulse width
    
    # Energy resolution effects
    event['s1_area_PE'] = event['s1_light_yield'] * np.random.normal(1.0, 0.1)  # 10% resolution
    event['s2_area_PE'] = event['s2_charge_yield'] * np.random.normal(1.0, 0.05)  # 5% resolution
    
    # Calculate derived quantities
    event['s2_over_s1_ratio'] = event['s2_area_PE'] / max(event['s1_area_PE'], 0.1)
    event['log10_s2_over_s1'] = np.log10(event['s2_over_s1_ratio'])
    
    # Add timestamp (events distributed over a year)
    base_time = datetime(2024, 1, 1)
    random_days = np.random.uniform(0, 365)
    event['timestamp'] = base_time + timedelta(days=random_days)
    
    # Add detector conditions (temperature, pressure variations)
    event['detector_temp_K'] = np.random.normal(175, 1)  # Liquid xenon temperature
    event['gas_pressure_bar'] = np.random.normal(2.0, 0.1)  # Gas phase pressure
    event['electric_field_V_cm'] = np.random.normal(200, 20)  # Drift field
    
    # Quality metrics
    event['event_quality'] = np.random.beta(8, 2)  # Most events high quality
    event['pile_up_flag'] = np.random.choice([0, 1], p=[0.98, 0.02])  # 2% pile-up events
    
    return event

# --- Generate the full dataset ---
np.random.seed(42)  # For reproducibility
random.seed(42)

num_events = 50000  # Increased dataset size
events_list = []

# Define event distribution (more realistic rates)
event_types = {
    'background_ER': 0.92,      # 92% background electronic recoils
    'wimp_NR': 0.05,           # 5% WIMP candidates  
    'axion-like': 0.015,       # 1.5% axion-like events
    'sterile_neutrino': 0.01,  # 1% sterile neutrino candidates
    'primordial_BH': 0.005     # 0.5% primordial black hole signatures
}

print("Generating synthetic dark matter detection dataset...")
print(f"Total events: {num_events}")

for i in range(num_events):
    # Select event type based on realistic probabilities
    rand_val = np.random.random()
    cumulative_prob = 0
    
    for event_type, prob in event_types.items():
        cumulative_prob += prob
        if rand_val <= cumulative_prob:
            selected_type = event_type
            break
    
    events_list.append(generate_event(selected_type))
    
    if (i + 1) % 10000 == 0:
        print(f"Generated {i + 1} events...")

# Convert to DataFrame
dataset = pd.DataFrame(events_list)

print("\nDataset Head:")
print(dataset.head())
print("\nEvent Type Distribution:")
print(dataset['label'].value_counts())
print("\nDataset Shape:", dataset.shape)
print("\nColumn Names:")
print(list(dataset.columns))
# Add realistic detector effects and systematic uncertainties
print("\nAdding detector effects and systematic uncertainties...")

# Energy-dependent noise
energy_noise = np.random.normal(0, 0.1 * np.sqrt(dataset['recoil_energy_keV']), size=len(dataset))
dataset['recoil_energy_keV'] = np.clip(dataset['recoil_energy_keV'] + energy_noise, 0.1, None)

# Position-dependent light collection efficiency
r_detector = np.sqrt(dataset['position_x_mm']**2 + dataset['position_y_mm']**2)
light_collection_eff = 1.0 - 0.3 * (r_detector / 500.0)  # Reduced efficiency at edges
dataset['s1_area_PE'] *= light_collection_eff

# Depth-dependent charge collection (field non-uniformity)
z_normalized = (dataset['position_z_mm'] + 500) / 1000  # Normalize to [0,1]
charge_collection_eff = 0.8 + 0.2 * z_normalized  # Better collection at bottom
dataset['s2_area_PE'] *= charge_collection_eff

# Introduce realistic missing values
print("Introducing realistic data quality issues...")

# Missing S1 signals (threshold effects) - more likely for low energy events
s1_threshold_prob = 1.0 / (1.0 + np.exp(5 * (dataset['s1_area_PE'] - 3)))  # Sigmoid
s1_missing_mask = np.random.random(len(dataset)) < s1_threshold_prob
dataset.loc[s1_missing_mask, ['s1_light_yield', 's1_area_PE', 's1_width_ns']] = np.nan

# Missing S2 signals (rare but happens)
s2_missing_indices = dataset.sample(frac=0.001).index  # 0.1% missing S2
dataset.loc[s2_missing_indices, ['s2_charge_yield', 's2_area_PE', 's2_width_us']] = np.nan

# Position reconstruction failures
position_fail_indices = dataset.sample(frac=0.005).index  # 0.5% position failures
dataset.loc[position_fail_indices, ['position_x_mm', 'position_y_mm']] = np.nan

# Recalculate derived quantities with NaN handling
dataset['s2_over_s1_ratio'] = dataset['s2_area_PE'] / np.maximum(dataset['s1_area_PE'], 0.1)
dataset['log10_s2_over_s1'] = np.log10(dataset['s2_over_s1_ratio'])

print("\nFinal Dataset Summary:")
print(f"Total events: {len(dataset)}")
print(f"Features per event: {len(dataset.columns)}")
print(f"Missing values per column:")
for col in dataset.columns:
    missing_count = dataset[col].isna().sum()
    if missing_count > 0:
        print(f"  {col}: {missing_count} ({missing_count/len(dataset)*100:.2f}%)")

# Display physics-based feature statistics
print("\nKey Physics Features Summary:")
print(f"Energy range: {dataset['recoil_energy_keV'].min():.2f} - {dataset['recoil_energy_keV'].max():.2f} keV")
print(f"S2/S1 ratio range: {dataset['s2_over_s1_ratio'].min():.2f} - {dataset['s2_over_s1_ratio'].max():.2f}")
print(f"Log10(S2/S1) range: {dataset['log10_s2_over_s1'].min():.2f} - {dataset['log10_s2_over_s1'].max():.2f}")

# Show discrimination power between signal and background
print("\nSignal vs Background Discrimination:")
background_data = dataset[dataset['label'] == 'Background']
signal_data = dataset[dataset['label'] != 'Background']

print(f"Background S2/S1 median: {background_data['s2_over_s1_ratio'].median():.2f}")
print(f"Signal S2/S1 median: {signal_data['s2_over_s1_ratio'].median():.2f}")
print(f"Background energy median: {background_data['recoil_energy_keV'].median():.2f} keV")
print(f"Signal energy median: {signal_data['recoil_energy_keV'].median():.2f} keV")

# Save the enhanced dataset
print("\nSaving enhanced synthetic dark matter dataset...")

# Save to CSV with proper formatting
dataset.to_csv('dark_matter_synthetic_dataset.csv', index=False, float_format='%.6f')

# Save to JSON with proper formatting
dataset_json = dataset.copy()
# Convert timestamps to ISO format for JSON (safe conversion)
dataset_json['timestamp'] = dataset_json['timestamp'].apply(lambda t: t.isoformat() if hasattr(t, 'isoformat') else str(t))
# Replace NaN/NaT with None so json.dump doesn't choke
dataset_json = dataset_json.where(pd.notnull(dataset_json), None)
import json
with open('dark_matter_synthetic_dataset.json', 'w', encoding='utf-8') as f:
    json.dump(dataset_json.to_dict(orient='records'), f, indent=2, ensure_ascii=False)

# Create a metadata file with dataset information
metadata = {
    "dataset_name": "Synthetic Dark Matter Detection Dataset",
    "creation_date": datetime.now().isoformat(),
    "total_events": int(len(dataset)),
    "event_types": {k: int(v) for k, v in dataset['label'].value_counts().items()},
    "features": {
        "energy_features": ["recoil_energy_keV"],
        "light_features": ["s1_light_yield", "s1_area_PE", "s1_width_ns"],
        "charge_features": ["s2_charge_yield", "s2_area_PE", "s2_width_us"],
        "position_features": ["position_x_mm", "position_y_mm", "position_z_mm"],
        "derived_features": ["s2_over_s1_ratio", "log10_s2_over_s1", "drift_time_us"],
        "detector_features": ["detector_temp_K", "gas_pressure_bar", "electric_field_V_cm"],
        "quality_features": ["event_quality", "pile_up_flag"]
    },
    "physics_parameters": {
        "detector_radius_mm": 500,
        "detector_height_mm": 1000,
        "drift_velocity_mm_us": 1.33,
        "er_light_yield_pe_kev": 2.5,
        "nr_light_yield_pe_kev": 0.1,
        "er_charge_yield_e_kev": 50,
        "nr_charge_yield_e_kev": 2
    },
    "data_quality": {
        "missing_s1_events": int(dataset['s1_area_PE'].isna().sum()),
        "missing_s2_events": int(dataset['s2_area_PE'].isna().sum()),
        "missing_position_events": int(dataset['position_x_mm'].isna().sum()),
        "pile_up_events": int(dataset['pile_up_flag'].sum())
    }
}

import json
with open('dataset_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("Dataset saved successfully!")
print(f"Files created:")
print(f"  - dark_matter_synthetic_dataset.csv ({len(dataset)} events)")
print(f"  - dark_matter_synthetic_dataset.json ({len(dataset)} events)")
print(f"  - dataset_metadata.json (dataset information)")
print(f"\nDataset ready for machine learning analysis!")