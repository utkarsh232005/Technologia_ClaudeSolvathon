#!/usr/bin/env python3
"""
Main Classification Script for Visualization System
Classifies events with detailed feature importance analysis for chart generation
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
load_dotenv(Path('../.env'))

# Configuration
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY or API_KEY == "YOUR_GEMINI_API_KEY_HERE" or API_KEY == "API KEY HERE":
    print("=" * 80)
    print("ERROR: GEMINI_API_KEY not configured!")
    print("=" * 80)
    print("\nPlease set your Gemini API key in the .env file:")
    print("1. Open: ../.env")
    print("2. Replace 'API KEY HERE' with your actual Gemini API key")
    print("3. Get API key from: https://makersuite.google.com/app/apikey")
    print("")
    sys.exit(1)

API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={}"
MODEL_NAME = "gemini-2.0-flash-exp"

# Paths
CSV_PATH = Path('../dataset/dark_matter_synthetic_dataset.csv')
RESULTS_DIR = Path('results')
DETAILED_RESULTS_FILE = RESULTS_DIR / 'claude_classified_results_detailed.json'

# Create directories
RESULTS_DIR.mkdir(exist_ok=True)


def classify_event_with_importance(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Classify event and generate feature importance scores (0-100) for visualization
    """
    prompt = f"""You are a particle physics expert analyzing dark matter detector data.

EVENT DATA:
- Recoil Energy: {event_data.get('recoil_energy_keV', 'N/A')} keV
- S1 Signal: {event_data.get('s1_area_PE', 'N/A')} PE
- S2 Signal: {event_data.get('s2_area_PE', 'N/A')} PE
- S2/S1 Ratio: {event_data.get('s2_over_s1_ratio', 'N/A')}
- S1 Width: {event_data.get('s1_width_ns', 'N/A')} ns
- S2 Width: {event_data.get('s2_width_ns', 'N/A')} ns
- Position: ({event_data.get('position_x_mm', 0):.1f}, {event_data.get('position_y_mm', 0):.1f}, {event_data.get('position_z_mm', 0):.1f}) mm
- Drift Time: {event_data.get('drift_time_us', 'N/A')} μs

TASK 1 - CLASSIFICATION:
Classify as:
- Background (ER): Electronic Recoil - S2/S1 > 5
- WIMP-like (NR): Nuclear Recoil - S2/S1 between 2.0-4.0
- Axion-like: Exotic Electron Recoil - S2/S1 < 2.0

TASK 2 - FEATURE IMPORTANCE:
Rate each feature's importance (0-100) for this classification:
- s2_s1_ratio_importance: How critical was the S2/S1 ratio?
- energy_importance: How important was the recoil energy?
- pulse_shape_importance: How important were pulse widths (S1/S2)?
- position_importance: How important was spatial position?
- drift_time_importance: How important was drift time?

Provide your response as valid JSON.
"""

    response_schema = {
        "type": "OBJECT",
        "properties": {
            "classification": {"type": "STRING"},
            "confidence": {"type": "NUMBER"},
            "s2_s1_ratio_importance": {"type": "INTEGER"},
            "energy_importance": {"type": "INTEGER"},
            "pulse_shape_importance": {"type": "INTEGER"},
            "position_importance": {"type": "INTEGER"},
            "drift_time_importance": {"type": "INTEGER"},
            "reasoning": {"type": "STRING"}
        },
        "required": ["classification", "confidence", "s2_s1_ratio_importance", 
                     "energy_importance", "pulse_shape_importance", 
                     "position_importance", "drift_time_importance", "reasoning"]
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
            return {
                "classification": "Unknown",
                "confidence": 0.0,
                "s2_s1_ratio_importance": 0,
                "energy_importance": 0,
                "pulse_shape_importance": 0,
                "position_importance": 0,
                "drift_time_importance": 0,
                "reasoning": "No response from API"
            }

    except Exception as e:
        print(f"    ❌ Classification error: {e}")
        return {
            "classification": "Error",
            "confidence": 0.0,
            "s2_s1_ratio_importance": 0,
            "energy_importance": 0,
            "pulse_shape_importance": 0,
            "position_importance": 0,
            "drift_time_importance": 0,
            "reasoning": str(e)
        }


def process_events_for_visualization(df: pd.DataFrame, num_events: int = 10):
    """
    Process events with feature importance analysis for visualization
    """
    print(f"\n{'='*80}")
    print(f"PROCESSING {num_events} EVENTS FOR VISUALIZATION")
    print(f"{'='*80}\n")
    
    # Sample balanced events
    results = []
    
    # Try to get balanced representation
    unique_labels = df['label'].unique()
    events_per_label = max(1, num_events // len(unique_labels))
    
    sampled_events = []
    for label in unique_labels:
        label_events = df[df['label'] == label].sample(
            n=min(events_per_label, len(df[df['label'] == label]))
        )
        sampled_events.append(label_events)
    
    events = pd.concat(sampled_events).sample(frac=1).head(num_events)
    
    print(f"Selected {len(events)} events for analysis\n")
    
    for idx, (_, event) in enumerate(events.iterrows(), 1):
        event_dict = event.to_dict()
        event_id = idx
        
        print(f"[{idx}/{len(events)}] Event {event_id} (True: {event.get('label', 'Unknown')})")
        print(f"{'─'*80}")
        
        # Classify with importance analysis
        print("  ⏳ Analyzing event...")
        analysis = classify_event_with_importance(event_dict)
        
        classification = analysis.get('classification', 'Unknown')
        confidence = analysis.get('confidence', 0.0)
        
        print(f"  ✓ Classification: {classification}")
        print(f"  ✓ Confidence: {confidence:.2%}")
        print(f"  ✓ Feature Importance Scores:")
        print(f"      - S2/S1 Ratio:  {analysis.get('s2_s1_ratio_importance', 0)}/100")
        print(f"      - Energy:       {analysis.get('energy_importance', 0)}/100")
        print(f"      - Pulse Shape:  {analysis.get('pulse_shape_importance', 0)}/100")
        print(f"      - Position:     {analysis.get('position_importance', 0)}/100")
        print(f"      - Drift Time:   {analysis.get('drift_time_importance', 0)}/100")
        
        # Store detailed result
        result = {
            'event_id': event_id,
            'true_label': event.get('label', 'Unknown'),
            'event_data': {
                'recoil_energy_keV': event.get('recoil_energy_keV'),
                's2_over_s1_ratio': event.get('s2_over_s1_ratio'),
                's1_area_PE': event.get('s1_area_PE'),
                's2_area_PE': event.get('s2_area_PE'),
                's1_width_ns': event.get('s1_width_ns'),
                's2_width_ns': event.get('s2_width_ns'),
                'drift_time_us': event.get('drift_time_us')
            },
            'api_analysis': {
                'classification': classification,
                'confidence': confidence,
                'reasoning': analysis.get('reasoning', '')
            },
            'importance_analysis': {
                's2_s1_ratio_importance': analysis.get('s2_s1_ratio_importance', 0),
                'energy_importance': analysis.get('energy_importance', 0),
                'pulse_shape_importance': analysis.get('pulse_shape_importance', 0),
                'position_importance': analysis.get('position_importance', 0),
                'drift_time_importance': analysis.get('drift_time_importance', 0),
                'summary_reasoning': analysis.get('reasoning', '')
            }
        }
        results.append(result)
        
        print("")
        
        # Rate limiting
        if idx < len(events):
            time.sleep(1.5)
    
    # Save results
    with open(DETAILED_RESULTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    
    print(f"{'='*80}")
    print(f"✓ PROCESSING COMPLETE!")
    print(f"{'='*80}")
    print(f"\nResults saved to: {DETAILED_RESULTS_FILE}")
    print(f"Ready for visualization: python visualizer.py")
    print("")
    
    return results


def print_summary(results: List[Dict[str, Any]]):
    """Print classification summary"""
    print(f"\n{'='*80}")
    print("CLASSIFICATION SUMMARY")
    print(f"{'='*80}\n")
    
    correct = 0
    for r in results:
        true_label = r['true_label']
        predicted = r['api_analysis']['classification']
        confidence = r['api_analysis']['confidence']
        
        # Check if correct (base match)
        predicted_base = predicted.replace(' (ER)', '').replace(' (NR)', '')
        true_base = true_label.split('-')[0]
        is_correct = predicted_base.lower().startswith(true_base.lower())
        
        if is_correct:
            correct += 1
        
        match_symbol = "✓" if is_correct else "✗"
        print(f"{match_symbol} Event {r['event_id']:2d}: {true_label:20s} → {predicted:20s} ({confidence:5.1%})")
    
    accuracy = (correct / len(results)) * 100 if results else 0
    print(f"\n{'='*80}")
    print(f"Accuracy: {accuracy:.1f}% ({correct}/{len(results)} correct)")
    print(f"{'='*80}\n")


def main():
    parser = argparse.ArgumentParser(
        description='Classify dark matter events with feature importance for visualization'
    )
    parser.add_argument('--num-events', type=int, default=10, 
                       help='Number of events to classify (default: 10)')
    args = parser.parse_args()
    
    print(f"\n{'#'*80}")
    print("DARK MATTER EVENT CLASSIFICATION WITH FEATURE IMPORTANCE")
    print("For Visualization System")
    print(f"{'#'*80}")
    
    # Load dataset
    print(f"\nLoading dataset from: {CSV_PATH}")
    try:
        df = pd.read_csv(CSV_PATH)
        print(f"✓ Loaded {len(df):,} events\n")
    except FileNotFoundError:
        print(f"❌ Error: Dataset not found at {CSV_PATH}")
        print("Please run: python ../main.py to generate the dataset")
        sys.exit(1)
    
    # Process events
    results = process_events_for_visualization(df, num_events=args.num_events)
    
    # Print summary
    print_summary(results)
    
    print("Next steps:")
    print("  1. Run visualizer: python visualizer.py")
    print("  2. View charts in: charts_output/")
    print("")


if __name__ == '__main__':
    main()
