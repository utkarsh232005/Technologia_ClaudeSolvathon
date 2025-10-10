import pandas as pd
import numpy as np
import random

def generate_event(event_type):
    """Generates a single particle event with realistic features."""
    
    event = {}

    if event_type == 'background_ER':
        # Electronic Recoils (ER) - High S2/S1 ratio
        event['recoil_energy_keV'] = np.random.uniform(1, 20)
        event['s1_light_yield'] = np.random.uniform(5, 100)
        # S2 is much larger than S1
        event['s2_charge_yield'] = event['s1_light_yield'] * np.random.uniform(20, 50) 
        event['label'] = 'Background'

    elif event_type == 'wimp_NR':
        # WIMP-like Nuclear Recoils (NR) - Low S2/S1 ratio
        event['recoil_energy_keV'] = np.random.uniform(5, 50)
        event['s1_light_yield'] = np.random.uniform(50, 200)
        # S2 is comparable to or smaller than S1
        event['s2_charge_yield'] = event['s1_light_yield'] * np.random.uniform(0.5, 5)
        event['label'] = 'WIMP-like'
        
    elif event_type == 'axion-like':
        # Axions might appear as a small, sharp energy peak (ER-like)
        event['recoil_energy_keV'] = np.random.normal(loc=10, scale=0.5) # Centered around 10 keV
        event['s1_light_yield'] = np.random.uniform(10, 50)
        event['s2_charge_yield'] = event['s1_light_yield'] * np.random.uniform(20, 40)
        event['label'] = 'Axion-like'

    # Add other common features
    event['position_x_mm'] = np.random.uniform(-500, 500)
    event['position_y_mm'] = np.random.uniform(-500, 500)
    event['position_z_mm'] = np.random.uniform(-1000, 0)
    
    return event

# --- Generate the full dataset ---
num_events = 10000
events_list = []

for i in range(num_events):
    # Create mostly background events with some signals mixed in
    if i < 9500: # 95% background
        event_type = 'background_ER'
    elif i < 9900: # 4% WIMPs
        event_type = 'wimp_NR'
    else: # 1% Axions
        event_type = 'axion-like'
    
    events_list.append(generate_event(event_type))

# Convert the list of dictionaries to a pandas DataFrame
dataset = pd.DataFrame(events_list)

print("Dataset Head:")
print(dataset.head())
print("\nEvent Counts:")
print(dataset['label'].value_counts())
# Add some random noise to energy readings
noise = np.random.normal(0, 0.5, size=len(dataset)) # Mean=0, StdDev=0.5
dataset['recoil_energy_keV'] = dataset['recoil_energy_keV'] + noise

# Randomly introduce some missing values (e.g., 2% of S1 readings)
missing_indices = dataset.sample(frac=0.02).index
dataset.loc[missing_indices, 's1_light_yield'] = np.nan

print("\nDataset Head with Noise and Missing Values:")
print(dataset.head())

# saving the datasets
# Save to CSV
dataset.to_csv('dark_matter_synthetic_dataset.csv', index=False)

# Save to JSON
dataset.to_json('dark_matter_synthetic_dataset.json', orient='records')

print("\nDataset saved successfully!")