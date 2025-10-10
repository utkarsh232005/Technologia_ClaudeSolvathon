#!/usr/bin/env python3
"""
Enhanced Dark Matter Event Classifier with Detailed Scientific Explanations
Provides 7-section detailed analysis for each classified event
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in .env file.")

API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={}"
MODEL_NAME = "gemini-1.5-flash"

# Paths
CSV_PATH = Path('../dataset/dark_matter_synthetic_dataset.csv')
RESULTS_DIR = Path('results')
EXPLANATIONS_DIR = Path('explanations')

# Create directories
RESULTS_DIR.mkdir(exist_ok=True)
EXPLANATIONS_DIR.mkdir(exist_ok=True)


def classify_event(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Classify a single event using Gemini API with structured output
    """
    # Create classification prompt
    prompt = f"""You are a particle physics expert analyzing dark matter detector data.

EVENT DATA:
- Recoil Energy: {event_data.get('recoil_energy_keV', 'N/A')} keV
- S1 Signal: {event_data.get('s1_area_PE', 'N/A')} PE
- S2 Signal: {event_data.get('s2_area_PE', 'N/A')} PE
- S2/S1 Ratio: {event_data.get('s2_over_s1_ratio', 'N/A')}
- Position: ({event_data.get('position_x_mm', 0):.1f}, {event_data.get('position_y_mm', 0):.1f}, {event_data.get('position_z_mm', 0):.1f}) mm

CLASSIFICATION TASK:
Classify this event as one of:
- Background (ER): Electronic Recoil - S2/S1 > 5
- WIMP-like (NR): Nuclear Recoil - S2/S1 between 2.0-4.0
- Axion-like: Exotic Electron Recoil - S2/S1 < 2.0

Provide classification and confidence (0.0 to 1.0).
"""

    response_schema = {
        "type": "OBJECT",
        "properties": {
            "classification": {"type": "STRING"},
            "confidence": {"type": "NUMBER"}
        },
        "required": ["classification", "confidence"]
    }

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": response_schema,
            "temperature": 0.0
        }
    }

    url = API_URL_TEMPLATE.format(API_KEY)
    headers = {'Content-Type': 'application/json'}

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        result = response.json()

        if result.get('candidates') and result['candidates'][0].get('content'):
            text = result['candidates'][0]['content']['parts'][0]['text']
            return json.loads(text)
        else:
            return {"classification": "Unknown", "confidence": 0.0}

    except Exception as e:
        print(f"Classification error: {e}")
        return {"classification": "Error", "confidence": 0.0}


def generate_detailed_explanation(event_data: Dict[str, Any], classification_result: Dict[str, Any]) -> str:
    """
    Generate detailed 7-section scientific explanation for the classification
    """
    
    prompt = f"""You are writing a detailed scientific explanation for a dark matter detection experiment.

EVENT CLASSIFICATION RESULT:
- Classification: {classification_result['classification']}
- Confidence: {classification_result['confidence']:.2%}

EVENT DATA:
- Recoil Energy: {event_data.get('recoil_energy_keV', 'N/A')} keV
- S1 Signal: {event_data.get('s1_area_PE', 'N/A')} PE
- S2 Signal: {event_data.get('s2_area_PE', 'N/A')} PE
- S2/S1 Ratio: {event_data.get('s2_over_s1_ratio', 'N/A')}
- Pulse Shape (S1 width): {event_data.get('s1_width_ns', 'N/A')} ns
- Position: ({event_data.get('position_x_mm', 0):.1f}, {event_data.get('position_y_mm', 0):.1f}, {event_data.get('position_z_mm', 0):.1f}) mm
- Drift Time: {event_data.get('drift_time_us', 'N/A')} μs
- True Label: {event_data.get('label', 'Unknown')}

Write a comprehensive scientific explanation with these 7 sections:

## 1. CLASSIFICATION JUSTIFICATION
Explain step-by-step why this classification was chosen.
Reference specific physics principles (ionization, scintillation, recombination).

## 2. FEATURE ANALYSIS
For each key feature:
- **S2/S1 Ratio ({event_data.get('s2_over_s1_ratio', 'N/A')})**: What does this value indicate? How does it support the classification?
- **Energy ({event_data.get('recoil_energy_keV', 'N/A')} keV)**: Is it in the WIMP search window? Consistent with backgrounds?
- **Pulse Shape**: What does the S1 width tell us about the interaction?

## 3. PHYSICS INTERPRETATION
- What type of interaction likely occurred? (elastic scattering, Compton, photoelectric)
- Nuclear recoil vs electronic recoil analysis
- Consistency with liquid xenon detector response models
- Recombination probability and quenching factors

## 4. COMPARISON WITH KNOWN RESULTS
Compare this event signature with:
- **XENONnT**: Published S2/S1 discrimination bands and energy spectra
- **LUX-ZEPLIN (LZ)**: Background models and signal expectations
- **Known Background Sources**: Beta decay, gamma rays, neutrons

## 5. CONFIDENCE ASSESSMENT
Explain why confidence is {classification_result['confidence']:.0%}:
- What factors increase confidence? (clear S2/S1 separation, expected energy range)
- What uncertainties remain? (position effects, detector systematics)
- What could change the classification? (alternative explanations)

## 6. FOLLOW-UP RECOMMENDATIONS
Suggest 5 specific actions:
1. Cross-check against fiducial volume cuts
2. Verify pulse shape discrimination parameters
3. Check for pile-up or multiple scatter
4. Compare with calibration source data
5. Statistical analysis with similar events

## 7. LITERATURE REFERENCES
Cite 5 relevant references:
1. E. Aprile et al. (XENONnT Collaboration), "First Dark Matter Search with Nuclear Recoils..."
2. J. Aalbers et al. (LUX-ZEPLIN), "First Dark Matter Search Results..."
3. P. Agnes et al., "Low-Mass Dark Matter Search with DarkSide-50"
4. D.S. Akerib et al., "Signal yields, energy resolution, and recombination..."
5. E. Aprile et al., "Energy resolution and linearity in the keV to MeV range..."

Format as clean markdown with clear headers and bullet points.
Be specific, technical, and reference actual physics principles.
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 4000
        }
    }

    url = API_URL_TEMPLATE.format(API_KEY)
    headers = {'Content-Type': 'application/json'}

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        result = response.json()

        if result.get('candidates') and result['candidates'][0].get('content'):
            return result['candidates'][0]['content']['parts'][0]['text']
        else:
            return "Error: Could not generate explanation"

    except Exception as e:
        return f"Error generating explanation: {e}"


def process_events(df: pd.DataFrame, num_events: int = 5):
    """
    Process multiple events: classify and generate detailed explanations
    """
    # Sample balanced events
    signal_events = df[df['label'] != 'Background'].sample(n=min(num_events // 2, len(df[df['label'] != 'Background'])))
    background_events = df[df['label'] == 'Background'].sample(n=min(num_events - len(signal_events), len(df[df['label'] == 'Background'])))
    
    events = pd.concat([signal_events, background_events]).sample(frac=1)
    
    print(f"\n{'='*80}")
    print(f"Processing {len(events)} events with detailed scientific explanations")
    print(f"{'='*80}\n")
    
    results = []
    
    for idx, (_, event) in enumerate(events.iterrows(), 1):
        event_dict = event.to_dict()
        event_id = idx  # Use index as event_id
        
        print(f"\n[{idx}/{len(events)}] Processing Event (True Label: {event.get('label', 'Unknown')})")
        print(f"{'─'*80}")
        
        # Step 1: Classify
        print("  ⏳ Classifying event...")
        classification = classify_event(event_dict)
        print(f"  ✓ Classification: {classification['classification']} (Confidence: {classification['confidence']:.2%})")
        
        # Step 2: Generate detailed explanation
        print("  ⏳ Generating detailed scientific explanation...")
        explanation = generate_detailed_explanation(event_dict, classification)
        print(f"  ✓ Explanation generated ({len(explanation)} characters)")
        
        # Step 3: Save explanation
        explanation_file = EXPLANATIONS_DIR / f"event_{event_id}_explanation.md"
        with open(explanation_file, 'w', encoding='utf-8') as f:
            f.write(f"# Event {event_id} - Detailed Scientific Analysis\n\n")
            f.write(f"**Classification:** {classification['classification']}  \n")
            f.write(f"**Confidence:** {classification['confidence']:.2%}  \n")
            f.write(f"**True Label:** {event.get('label', 'Unknown')}  \n\n")
            f.write("---\n\n")
            f.write(explanation)
        
        print(f"  ✓ Saved to: {explanation_file}")
        
        # Store result
        result = {
            'event_id': event_id,
            'true_label': event.get('label', 'Unknown'),
            'classification': classification['classification'],
            'confidence': classification['confidence'],
            's2_over_s1_ratio': event.get('s2_over_s1_ratio'),
            'recoil_energy_keV': event.get('recoil_energy_keV'),
            'explanation_file': str(explanation_file)
        }
        results.append(result)
        
        # Rate limiting
        if idx < len(events):
            time.sleep(2)
    
    # Save summary results
    results_file = RESULTS_DIR / 'classification_results.json'
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n{'='*80}")
    print(f"✓ Processing complete!")
    print(f"  - Results saved to: {results_file}")
    print(f"  - Detailed explanations in: {EXPLANATIONS_DIR}/")
    print(f"{'='*80}\n")
    
    return results


def main():
    parser = argparse.ArgumentParser(description='Enhanced Dark Matter Event Classifier')
    parser.add_argument('--num-events', type=int, default=5, help='Number of events to process')
    args = parser.parse_args()
    
    # Load dataset
    print(f"Loading dataset from: {CSV_PATH}")
    try:
        df = pd.read_csv(CSV_PATH)
        print(f"✓ Loaded {len(df)} events")
    except FileNotFoundError:
        print(f"Error: Dataset not found at {CSV_PATH}")
        print("Please run: python main.py to generate the dataset")
        sys.exit(1)
    
    # Process events
    results = process_events(df, num_events=args.num_events)
    
    # Print summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    for r in results:
        match = "✓" if r['classification'].startswith(r['true_label'].split('-')[0]) else "✗"
        print(f"{match} Event {r['event_id']}: {r['true_label']} → {r['classification']} ({r['confidence']:.0%})")
    print("="*80 + "\n")


if __name__ == '__main__':
    main()
