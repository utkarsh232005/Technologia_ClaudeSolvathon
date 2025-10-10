#!/usr/bin/env python3
"""
Quick test script for Physics-Based Hypothesis Generation feature
"""

import json
import os

# Check if results exist
if os.path.exists('dataset/claude_classified_results_detailed.json'):
    print("✅ Found classification results")
    
    with open('dataset/claude_classified_results_detailed.json', 'r') as f:
        results = json.load(f)
    
    print(f"📊 Total classified events: {len(results)}")
    
    # Check for anomaly analysis
    if os.path.exists('anomaly_analysis/comprehensive_analysis.json'):
        print("✅ Found hypothesis generation results")
        
        with open('anomaly_analysis/comprehensive_analysis.json', 'r') as f:
            analysis = json.load(f)
        
        print(f"\n{'='*70}")
        print("HYPOTHESIS GENERATION SUMMARY")
        print(f"{'='*70}")
        print(f"Analysis Date: {analysis.get('analysis_date', 'N/A')}")
        print(f"Total Events Analyzed: {analysis.get('total_events_analyzed', 0)}")
        print(f"Anomalies Found: {analysis.get('total_anomalies_found', 0)}")
        print(f"Hypotheses Generated: {analysis.get('hypotheses_generated', 0)}")
        
        # Show top 3 anomalies
        if 'anomalies' in analysis and len(analysis['anomalies']) > 0:
            print(f"\n{'='*70}")
            print("TOP 3 ANOMALIES")
            print(f"{'='*70}")
            
            for idx, item in enumerate(analysis['anomalies'][:3], 1):
                anomaly = item['anomaly']
                hypotheses = item['hypotheses']
                
                print(f"\n{idx}. Event ID: {anomaly['Event_ID']}")
                print(f"   Severity: {anomaly['Severity'].upper()}")
                print(f"   Anomaly Score: {anomaly['Anomaly_Score']:.2f}")
                print(f"   Classification: {anomaly['Classification']}")
                
                if 'hypothesis_1' in hypotheses:
                    h1 = hypotheses['hypothesis_1']
                    print(f"\n   Most Likely Hypothesis ({h1.get('probability', 'N/A')}):")
                    print(f"   → {h1.get('mechanism', 'N/A')}")
                
                if 'immediate_actions' in hypotheses:
                    print(f"\n   Immediate Actions:")
                    for action in hypotheses['immediate_actions'][:2]:
                        print(f"   • {action}")
        
        print(f"\n{'='*70}")
        print("📁 Detailed analyses available in: anomaly_analysis/")
        print(f"{'='*70}\n")
        
    else:
        print("\n❌ No hypothesis generation results found")
        print("💡 Run with --generate-hypotheses flag:")
        print("   python mainClassify.py --num-events 10 --generate-hypotheses\n")
        
else:
    print("❌ No classification results found")
    print("💡 Run mainClassify.py first:")
    print("   python mainClassify.py --num-events 10\n")
