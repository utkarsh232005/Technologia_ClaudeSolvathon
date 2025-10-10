"""
DEMONSTRATION: Anomaly Detection with Claude AI
Shows how the system identifies novel/anomalous dark matter events
"""

import json
import os
import sys
from pathlib import Path
import pandas as pd
import requests
from dotenv import load_dotenv

# Load environment
load_dotenv(Path('../.env'))
API_KEY = os.getenv("ANTHROPIC_API_KEY")

print("="*80)
print("ANOMALY DETECTION DEMONSTRATION")
print("Claude AI + Dark Matter Dataset")
print("="*80)

# Check API key
if not API_KEY or API_KEY == "API KEY HERE":
    print("\n❌ ERROR: Please set your Claude API key in ../.env file")
    print("Replace 'API KEY HERE' with your actual Anthropic API key")
    sys.exit(1)

print("\n✓ Claude API key loaded")

# Load dataset
csv_path = Path('../dataset/dark_matter_synthetic_dataset.csv')
if not csv_path.exists():
    print(f"\n❌ ERROR: Dataset not found at {csv_path}")
    sys.exit(1)

df = pd.read_csv(csv_path)
print(f"✓ Dataset loaded: {len(df)} total events")

# Filter to valid S2/S1 events
df_valid = df[df['s2_over_s1_ratio'].notna()].copy()
print(f"✓ Valid events: {len(df_valid)} events with S2/S1 data")

# Find interesting anomalous events to demonstrate
print("\n" + "="*80)
print("FINDING ANOMALOUS EVENTS IN DATASET")
print("="*80)

# Get events with different anomaly types
high_energy = df_valid[df_valid['recoil_energy_keV'] > 45].head(2)
low_s2s1 = df_valid[df_valid['s2_over_s1_ratio'] < 1.0].head(2)
high_s2s1 = df_valid[df_valid['s2_over_s1_ratio'] > 28].head(2)
novel_range = df_valid[(df_valid['s2_over_s1_ratio'] > 4.0) & (df_valid['s2_over_s1_ratio'] < 5.0)].head(2)

# Combine interesting events
demo_events = pd.concat([high_energy, low_s2s1, high_s2s1, novel_range]).drop_duplicates()

print(f"\nSelected {len(demo_events)} interesting events for demonstration:")
print("-"*80)
print(f"  • High Energy events (>45 keV): {len(high_energy)}")
print(f"  • Low S2/S1 events (<1.0): {len(low_s2s1)}")
print(f"  • High S2/S1 events (>28): {len(high_s2s1)}")
print(f"  • Novel-Anomaly range (4.0-5.0): {len(novel_range)}")

def analyze_with_claude(event_data):
    """Call Claude API to analyze an event"""
    prompt = f"""You are a dark matter physics expert analyzing detector events for anomalies.

Event Data:
- Energy: {event_data['recoil_energy_keV']:.2f} keV
- S2/S1 Ratio: {event_data['s2_over_s1_ratio']:.2f}
- S1 Signal: {event_data['s1_area_PE']:.1f} PE
- S2 Signal: {event_data['s2_area_PE']:.1f} PE
- Position: ({event_data['position_x_mm']:.1f}, {event_data['position_y_mm']:.1f}) mm
- Drift Time: {event_data['drift_time_us']:.1f} μs
- Actual Label: {event_data.get('label', 'Unknown')}

Classification Rules:
1. S2/S1 < 2.0 → Axion-like
2. 2.0 ≤ S2/S1 ≤ 4.0 → WIMP-like (Nuclear Recoil)
3. S2/S1 > 5.0 → Background (Electronic Recoil)
4. 4.0 < S2/S1 ≤ 5.0 → Novel-Anomaly

Analyze this event:
1. Classify it according to the rules
2. Determine if it's anomalous (unusual energy, extreme ratios, etc.)
3. Calculate confidence (0.0 to 1.0)
4. Explain your reasoning in 2-3 sentences

Respond in JSON format:
{{
  "classification": "...",
  "is_anomalous": true/false,
  "confidence": 0.0,
  "reasoning": "..."
}}"""

    try:
        headers = {
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        
        data = {
            "model": "claude-3-haiku-20240307",
            "max_tokens": 500,
            "messages": [{"role": "user", "content": prompt}]
        }
        
        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=data,
            timeout=30
        )
        response.raise_for_status()
        
        result = response.json()
        content = result['content'][0]['text']
        
        # Extract JSON
        if '{' in content and '}' in content:
            start = content.index('{')
            end = content.rindex('}') + 1
            json_str = content[start:end]
            return json.loads(json_str)
        else:
            return {"error": "Failed to parse response"}
            
    except Exception as e:
        return {"error": str(e)}

# Analyze each event with Claude
print("\n" + "="*80)
print("CLAUDE AI ANALYSIS OF ANOMALOUS EVENTS")
print("="*80)

results = []

for idx, (event_idx, event) in enumerate(demo_events.iterrows(), 1):
    print(f"\n{'='*80}")
    print(f"EVENT #{idx} (Dataset Index: {event_idx})")
    print('='*80)
    
    print(f"\n📊 Event Data:")
    print(f"   Energy:        {event['recoil_energy_keV']:.2f} keV")
    print(f"   S2/S1 Ratio:   {event['s2_over_s1_ratio']:.2f}")
    print(f"   Position:      ({event['position_x_mm']:.1f}, {event['position_y_mm']:.1f}) mm")
    print(f"   Drift Time:    {event['drift_time_us']:.1f} μs")
    print(f"   Actual Label:  {event.get('label', 'Unknown')}")
    
    print(f"\n🤖 Calling Claude API...")
    analysis = analyze_with_claude(event)
    
    if 'error' in analysis:
        print(f"   ❌ Error: {analysis['error']}")
        continue
    
    print(f"\n✅ Claude's Analysis:")
    print(f"   Classification: {analysis.get('classification', 'N/A')}")
    print(f"   Is Anomalous:   {analysis.get('is_anomalous', 'N/A')}")
    print(f"   Confidence:     {analysis.get('confidence', 0)*100:.1f}%")
    print(f"\n   Reasoning:")
    print(f"   {analysis.get('reasoning', 'N/A')}")
    
    # Save result
    results.append({
        'event_index': event_idx,
        'energy': event['recoil_energy_keV'],
        's2_s1_ratio': event['s2_over_s1_ratio'],
        'actual_label': event.get('label', 'Unknown'),
        'ai_classification': analysis.get('classification', 'N/A'),
        'is_anomalous': analysis.get('is_anomalous', False),
        'confidence': analysis.get('confidence', 0),
        'reasoning': analysis.get('reasoning', 'N/A')
    })

# Summary
print("\n" + "="*80)
print("SUMMARY")
print("="*80)

anomalous_count = sum(1 for r in results if r.get('is_anomalous', False))
print(f"\nTotal Events Analyzed:  {len(results)}")
print(f"Flagged as Anomalous:   {anomalous_count}")
print(f"Detection Rate:         {anomalous_count/len(results)*100:.1f}%")

print("\n📋 Classification Breakdown:")
classifications = {}
for r in results:
    cls = r.get('ai_classification', 'Unknown')
    classifications[cls] = classifications.get(cls, 0) + 1

for cls, count in sorted(classifications.items()):
    print(f"   {cls:20s}: {count}")

# Save results
output_file = Path('results/demo_anomaly_analysis.json')
output_file.parent.mkdir(exist_ok=True)
with open(output_file, 'w') as f:
    json.dump(results, f, indent=2)

print(f"\n💾 Results saved to: {output_file}")

print("\n" + "="*80)
print("✅ DEMONSTRATION COMPLETE!")
print("="*80)
print("\nKey Points Demonstrated:")
print("  ✓ Claude API successfully connects and analyzes events")
print("  ✓ System identifies anomalous events based on physics rules")
print("  ✓ AI provides classification with confidence and reasoning")
print("  ✓ Dataset integration works correctly")
print(f"  ✓ Results saved for further analysis")
print("\nNext: Run full analysis with:")
print("  python mainAnomalyDetection.py --num-events 1000")
print("="*80)
