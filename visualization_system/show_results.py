#!/usr/bin/env python3
"""
Display Classification Results with Feature Importance in Terminal
"""

import json
from pathlib import Path

RESULTS_FILE = Path('results/claude_classified_results_detailed.json')

def print_header(text, char='='):
    """Print a formatted header"""
    width = 80
    print(f"\n{char * width}")
    print(f"{text:^{width}}")
    print(f"{char * width}\n")

def print_event_summary(event):
    """Print detailed summary of a single event"""
    event_id = event['event_id']
    true_label = event['true_label']
    classification = event['api_analysis']['classification']
    confidence = event['api_analysis']['confidence']
    
    # Determine if correct
    is_correct = classification.split()[0].lower() in true_label.lower()
    symbol = "✓" if is_correct else "✗"
    
    print(f"\n{'─'*80}")
    print(f"{symbol} EVENT {event_id}: {true_label} → {classification} ({confidence:.0%})")
    print(f"{'─'*80}")
    
    # Event data
    data = event['event_data']
    print("\n📊 EVENT DATA:")
    print(f"   Energy:       {data['recoil_energy_keV']:.3f} keV")
    print(f"   S2/S1 Ratio:  {data['s2_over_s1_ratio']}")
    print(f"   S1 Signal:    {data['s1_area_PE']} PE")
    print(f"   S2 Signal:    {data['s2_area_PE']:.3f} PE")
    print(f"   S1 Width:     {data['s1_width_ns']} ns")
    print(f"   Drift Time:   {data['drift_time_us']:.3f} μs")
    
    # Feature importance
    importance = event['importance_analysis']
    print("\n🎯 FEATURE IMPORTANCE SCORES (0-100):")
    
    features = [
        ('S2/S1 Ratio', importance['s2_s1_ratio_importance']),
        ('Energy', importance['energy_importance']),
        ('Pulse Shape', importance['pulse_shape_importance']),
        ('Position', importance['position_importance']),
        ('Drift Time', importance['drift_time_importance'])
    ]
    
    for feature_name, score in features:
        bar = create_bar(score)
        color = get_color(score)
        print(f"   {feature_name:15s} {bar} {score:3d}/100 {color}")
    
    # AI reasoning
    print("\n💭 AI REASONING:")
    reasoning = importance['summary_reasoning']
    # Wrap text to 76 characters
    words = reasoning.split()
    line = "   "
    for word in words:
        if len(line + word) > 76:
            print(line)
            line = "   " + word + " "
        else:
            line += word + " "
    if line.strip():
        print(line)

def create_bar(score):
    """Create a visual bar for scores"""
    filled = int(score / 5)  # 20 blocks max (100/5)
    empty = 20 - filled
    return f"[{'█' * filled}{'░' * empty}]"

def get_color(score):
    """Return color indicator based on score"""
    if score >= 70:
        return "🟢 HIGH"
    elif score >= 40:
        return "🟡 MEDIUM"
    else:
        return "🔴 LOW"

def print_summary(results):
    """Print overall summary statistics"""
    total = len(results)
    correct = sum(1 for r in results 
                  if r['api_analysis']['classification'].split()[0].lower() 
                  in r['true_label'].lower())
    
    accuracy = (correct / total * 100) if total > 0 else 0
    avg_confidence = sum(r['api_analysis']['confidence'] for r in results) / total if total > 0 else 0
    
    print_header("SUMMARY STATISTICS")
    print(f"   Total Events:      {total}")
    print(f"   Correct:           {correct}")
    print(f"   Accuracy:          {accuracy:.1f}%")
    print(f"   Avg Confidence:    {avg_confidence:.1%}")
    
    # Classification breakdown
    print("\n   CLASSIFICATIONS:")
    class_counts = {}
    for r in results:
        cls = r['api_analysis']['classification']
        class_counts[cls] = class_counts.get(cls, 0) + 1
    
    for cls, count in sorted(class_counts.items()):
        print(f"      {cls:20s}: {count:2d} events")
    
    # Feature importance averages
    print("\n   AVERAGE FEATURE IMPORTANCE:")
    avg_importance = {
        'S2/S1 Ratio': 0,
        'Energy': 0,
        'Pulse Shape': 0,
        'Position': 0,
        'Drift Time': 0
    }
    
    for r in results:
        imp = r['importance_analysis']
        avg_importance['S2/S1 Ratio'] += imp['s2_s1_ratio_importance']
        avg_importance['Energy'] += imp['energy_importance']
        avg_importance['Pulse Shape'] += imp['pulse_shape_importance']
        avg_importance['Position'] += imp['position_importance']
        avg_importance['Drift Time'] += imp['drift_time_importance']
    
    for key in avg_importance:
        avg_importance[key] /= total
    
    for feature, avg_score in sorted(avg_importance.items(), key=lambda x: x[1], reverse=True):
        bar = create_bar(int(avg_score))
        print(f"      {feature:15s} {bar} {avg_score:5.1f}/100")

def main():
    """Main display function"""
    print_header("🌌 DARK MATTER EVENT CLASSIFICATION RESULTS 🌌", "━")
    
    # Load results
    if not RESULTS_FILE.exists():
        print(f"❌ No results file found at: {RESULTS_FILE}")
        print("   Run: python mainClassify.py --num-events 10")
        return
    
    with open(RESULTS_FILE, 'r') as f:
        results = json.load(f)
    
    print(f"📁 Loaded {len(results)} classified events\n")
    
    # Display each event
    for event in results:
        print_event_summary(event)
    
    # Display summary
    print_summary(results)
    
    print_header("📊 VISUALIZATION CHARTS AVAILABLE 📊", "━")
    print("   Location: charts_output/")
    print("   Files:")
    print("      1. 01_discrimination_bands.png")
    print("      2. 02_class_distribution.png")
    print("      3. 03_classification_accuracy.png")
    print("      4. 04_energy_distributions.png")
    print("      5. 05_s2s1_distributions.png")
    print("\n   To view charts: python view_charts.py\n")

if __name__ == '__main__':
    main()
