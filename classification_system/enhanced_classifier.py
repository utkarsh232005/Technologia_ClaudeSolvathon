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

API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={}"
MODEL_NAME = "gemini-2.0-flash-exp"

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
    Generate detailed 7-section explanation in SIMPLE, EASY-TO-UNDERSTAND language
    """
    
    prompt = f"""You are explaining a dark matter detector event to someone who is smart but not a particle physicist. Use SIMPLE, CLEAR language that anyone can understand.

EVENT RESULT:
- Classification: {classification_result['classification']}
- Confidence: {classification_result['confidence']:.2%}

DETECTOR READINGS:
- Energy Released: {event_data.get('recoil_energy_keV', 'N/A')} keV (think of it like how hard something hit)
- First Light Flash (S1): {event_data.get('s1_area_PE', 'N/A')} units
- Second Light Flash (S2): {event_data.get('s2_area_PE', 'N/A')} units
- S2/S1 Ratio: {event_data.get('s2_over_s1_ratio', 'N/A')} (this tells us WHAT hit the detector)
- How Long the Flash Lasted: {event_data.get('s1_width_ns', 'N/A')} nanoseconds
- Where It Happened: ({event_data.get('position_x_mm', 0):.1f}, {event_data.get('position_y_mm', 0):.1f}, {event_data.get('position_z_mm', 0):.1f}) mm inside the detector
- Actual Answer: {event_data.get('label', 'Unknown')}

Write a SIMPLE explanation with these 7 sections. Use everyday language, short sentences, and clear analogies:

## 1. WHY WE CHOSE THIS CLASSIFICATION
Explain in simple terms why we think this is what hit the detector.
Use analogies like "imagine dropping different balls into water - each makes different ripples"
Keep it under 150 words.

## 2. WHAT THE NUMBERS TELL US
Break down each measurement:
- **S2/S1 Ratio ({event_data.get('s2_over_s1_ratio', 'N/A')})**: Is this ratio high, medium, or low? What does that mean? Use simple comparisons.
- **Energy ({event_data.get('recoil_energy_keV', 'N/A')} keV)**: Is this a lot or a little energy? What would create this?
- **Flash Duration**: Did the light last long or short? Why does that matter?

Keep each point to 2-3 sentences max.

## 3. WHAT ACTUALLY HAPPENED
Explain the physics like you're telling a story:
- What kind of particle probably hit the detector?
- Did it hit a nucleus (the heavy center) or an electron (the light outer part)?
- Why did it create the pattern we see?

Use analogies - like bowling balls vs ping pong balls hitting things.

## 4. COMPARING TO OTHER EXPERIMENTS
Other labs have seen similar things. In simple terms:
- **XENONnT Lab**: What have they seen that's similar?
- **LUX-ZEPLIN Lab**: How does our event compare?
- **Known "Noise"**: Could this be something ordinary like radiation from rocks?

Keep it conversational.

## 5. HOW SURE ARE WE?
We're {classification_result['confidence']:.0%} confident. Explain why:
- What makes us MORE sure? (the numbers match perfectly, everything looks right)
- What makes us LESS sure? (some readings are borderline, could be two things)
- What could change our mind?

Like a detective explaining their case.

## 6. WHAT TO DO NEXT
5 simple next steps to verify this result:
1. Check if it happened in the "good zone" of the detector
2. Look at how the light pulse changed over time
3. Make sure two particles didn't hit at the same time
4. Compare with our calibration tests
5. Find other similar events and see if they match

Each point should be one clear sentence.

## 7. SCIENTIFIC PAPERS TO READ
5 references in simple format:
1. XENONnT team - "How we hunt for dark matter" (explain what this paper is about)
2. LUX-ZEPLIN team - "Our first results" (one sentence on what they found)
3. DarkSide team - "Looking for low-mass particles" (why this matters)
4. General detector paper - "How our detector works" (explain the basics)
5. Calibration paper - "Testing our equipment" (why we need this)

IMPORTANT: Use simple words, short sentences, clear analogies. NO jargon without explaining it. Make it readable by a high school student.
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
        print("  ⏳ Generating detailed explanation in simple language...")
        explanation = generate_detailed_explanation(event_dict, classification)
        print(f"  ✓ Explanation generated!\n")
        
        # Display the explanation immediately
        print(f"\n{'╔' + '═'*78 + '╗'}")
        print(f"║ {'DETAILED EXPLANATION - EVENT ' + str(event_id):^76} ║")
        print(f"{'╚' + '═'*78 + '╝'}\n")
        print(explanation)
        print(f"\n{'─'*80}\n")
        
        # Step 3: Save explanation to file (optional backup)
        explanation_file = EXPLANATIONS_DIR / f"event_{event_id}_explanation.md"
        with open(explanation_file, 'w', encoding='utf-8') as f:
            f.write(f"# Event {event_id} - Easy-to-Understand Analysis\n\n")
            f.write(f"**Classification:** {classification['classification']}  \n")
            f.write(f"**Confidence:** {classification['confidence']:.2%}  \n")
            f.write(f"**True Label:** {event.get('label', 'Unknown')}  \n\n")
            f.write("---\n\n")
            f.write(explanation)
        
        print(f"  💾 Backup saved to: {explanation_file}")
        
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
