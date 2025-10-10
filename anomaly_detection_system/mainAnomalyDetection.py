#!/usr/bin/env python3
"""
Advanced Anomaly Detection System for Dark Matter Events
Uses Claude AI for intelligent anomaly classification and analysis
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

# Configuration - Using Claude API
API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not API_KEY or API_KEY == "API KEY HERE":
    print("\n" + "="*80)
    print("ERROR: ANTHROPIC_API_KEY not configured!")
    print("="*80)
    print("\nPlease set your Claude API key in the .env file:")
    print("1. Open: ../.env")
    print("2. Replace 'API KEY HERE' with your actual Claude API key")
    print("3. Get API key from: https://console.anthropic.com/")
    print("\n" + "="*80 + "\n")
    sys.exit(1)

API_URL = "https://api.anthropic.com/v1/messages"
MODEL_NAME = "claude-3-haiku-20240307"  # Verified working model

# Paths
CSV_PATH = Path('../dataset/dark_matter_synthetic_dataset.csv')
RESULTS_DIR = Path('results')
ANOMALY_REPORTS_DIR = Path('anomaly_reports')

# Create directories
RESULTS_DIR.mkdir(exist_ok=True)
ANOMALY_REPORTS_DIR.mkdir(exist_ok=True)


def classify_event_with_claude(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Classify a single event using Claude API
    Returns classification and confidence
    """
    # Extract data with correct column names
    energy = event_data.get('recoil_energy_keV', 'N/A')
    s2_s1 = event_data.get('s2_over_s1_ratio', 'N/A')
    s1_area = event_data.get('s1_area_PE', 'N/A')
    s2_area = event_data.get('s2_area_PE', 'N/A')
    pos_x = event_data.get('position_x_mm', 'N/A')
    pos_y = event_data.get('position_y_mm', 'N/A')
    drift = event_data.get('drift_time_us', 'N/A')
    s1_width = event_data.get('s1_width_ns', 'N/A')
    
    prompt = f"""You are a dark matter physics expert analyzing detector events.

Event Data:
- Energy: {energy} keV
- S2/S1 Ratio: {s2_s1}
- S1 Signal: {s1_area} PE
- S2 Signal: {s2_area} PE
- Position: ({pos_x}, {pos_y}) mm
- Drift Time: {drift} μs
- S1 Pulse Width: {s1_width} ns

Classification Rules:
1. S2/S1 < 2.0 → Axion-like
2. 2.0 ≤ S2/S1 ≤ 4.0 → WIMP-like (NR)
3. S2/S1 > 5.0 → Background (ER)
4. 4.0 < S2/S1 ≤ 5.0 → Novel-Anomaly

Classify this event and provide:
1. Classification (one of: Background (ER), WIMP-like (NR), Axion-like, Novel-Anomaly, Sterile-Neutrino, Unknown)
2. Confidence (0.0 to 1.0)
3. Brief reasoning

Respond in JSON format:
{{"classification": "...", "confidence": 0.0, "reasoning": "..."}}"""

    try:
        headers = {
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        
        data = {
            "model": MODEL_NAME,
            "max_tokens": 500,
            "messages": [{
                "role": "user",
                "content": prompt
            }]
        }
        
        response = requests.post(API_URL, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        content = result['content'][0]['text']
        
        # Extract JSON from response
        if '{' in content and '}' in content:
            start = content.index('{')
            end = content.rindex('}') + 1
            json_str = content[start:end]
            analysis = json.loads(json_str)
            return analysis
        else:
            return {
                "classification": "Unknown",
                "confidence": 0.0,
                "reasoning": "Failed to parse AI response"
            }
            
    except Exception as e:
        print(f"Warning: API call failed - {e}")
        return {
            "classification": "Error",
            "confidence": 0.0,
            "reasoning": str(e)
        }


def detect_anomalies_advanced(df: pd.DataFrame, use_claude: bool = True, 
                              max_events: int = None, threshold: float = 0.3) -> pd.DataFrame:
    """
    Multi-factor anomaly detection with optional Claude AI analysis
    
    Args:
        df: DataFrame with event data
        use_claude: Whether to use Claude API for classification
        max_events: Maximum number of events to analyze
        threshold: Minimum anomaly score to flag an event
    """
    print("\n" + "="*80)
    print("ADVANCED ANOMALY DETECTION SYSTEM")
    print("="*80 + "\n")
    
    if max_events:
        df = df.head(max_events)
        print(f"Analyzing first {max_events} events...\n")
    else:
        print(f"Analyzing all {len(df)} events...\n")
    
    anomalies = []
    processed = 0
    
    for idx, event in df.iterrows():
        processed += 1
        
        if processed % 100 == 0:
            print(f"Processed {processed}/{len(df)} events...")
        
        anomaly_flags = []
        anomaly_score = 0.0
        
        # Get classification if using Claude
        classification_result = None
        if use_claude:
            event_dict = {
                'recoil_energy_keV': event.get('recoil_energy_keV', 0),
                's2_over_s1_ratio': event.get('s2_over_s1_ratio', 0),
                's1_area_PE': event.get('s1_area_PE', 0),
                's2_area_PE': event.get('s2_area_PE', 0),
                'position_x_mm': event.get('position_x_mm', 0),
                'position_y_mm': event.get('position_y_mm', 0),
                'drift_time_us': event.get('drift_time_us', 0),
                's1_width_ns': event.get('s1_width_ns', 0)
            }
            classification_result = classify_event_with_claude(event_dict)
            
            # Check for low confidence classification
            if classification_result['confidence'] < 0.6:
                anomaly_flags.append({
                    'type': 'Low AI Confidence',
                    'severity': 'high',
                    'value': classification_result['confidence'],
                    'weight': 0.3
                })
                anomaly_score += 0.3
        
        # 1. Unusual energy (adjusted thresholds for realistic detection)
        energy = event.get('recoil_energy_keV', 0)
        if energy < 1.0 or energy > 40:
            severity = 'high' if energy > 50 or energy < 0.7 else 'medium'
            anomaly_flags.append({
                'type': 'Extreme Energy',
                'severity': severity,
                'value': energy,
                'weight': 0.25
            })
            anomaly_score += 0.25
        
        # 2. Extreme S2/S1 ratio (adjusted thresholds)
        ratio = event.get('s2_over_s1_ratio', 0)
        if ratio > 25 or ratio < 1.0:
            severity = 'high' if ratio > 30 or ratio < 0.5 else 'medium'
            anomaly_flags.append({
                'type': 'Anomalous S2/S1 Ratio',
                'severity': severity,
                'value': ratio,
                'weight': 0.25
            })
            anomaly_score += 0.25
        
        # 3. Edge position events
        x_pos = event.get('position_x_mm', 0)
        y_pos = event.get('position_y_mm', 0)
        if abs(x_pos) > 400 or abs(y_pos) > 400:  # Changed from 40 cm to 400 mm
            anomaly_flags.append({
                'type': 'Edge Event',
                'severity': 'medium',
                'value': f"({x_pos:.1f}, {y_pos:.1f})",
                'weight': 0.15
            })
            anomaly_score += 0.15
        
        # 4. Unusual pulse shape (if available)
        s1_width = event.get('s1_width_ns', 0)
        if pd.notna(s1_width):
            if s1_width > 100 or s1_width < 10:
                anomaly_flags.append({
                    'type': 'Atypical S1 Pulse Width',
                    'severity': 'medium',
                    'value': s1_width,
                    'weight': 0.15
                })
                anomaly_score += 0.15
        
        # 5. Extreme drift time (adjusted threshold)
        drift_time = event.get('drift_time_us', 0)
        if drift_time > 700 or drift_time < 50:
            severity = 'high' if drift_time > 750 or drift_time < 10 else 'medium'
            anomaly_flags.append({
                'type': 'Unusual Drift Time',
                'severity': severity,
                'value': drift_time,
                'weight': 0.1
            })
            anomaly_score += 0.1
        
        # 6. Classification ambiguity (if using Claude)
        if classification_result and 0.4 < classification_result['confidence'] < 0.7:
            anomaly_flags.append({
                'type': 'Classification Ambiguity',
                'severity': 'medium',
                'value': classification_result['confidence'],
                'weight': 0.15
            })
            anomaly_score += 0.15
        
        # If anomaly score is significant, add to list
        if anomaly_score >= threshold:  # Use configurable threshold
            anomaly_entry = {
                'Event_ID': event.get('event_id', idx),
                'Anomaly_Score': min(anomaly_score, 1.0),
                'Severity': (
                    'Critical' if anomaly_score > 0.7 
                    else 'High' if anomaly_score > 0.5 
                    else 'Medium'
                ),
                'Num_Flags': len(anomaly_flags),
                'Energy_keV': energy,
                'S2_S1_Ratio': ratio,
                'Position_X': x_pos,
                'Position_Y': y_pos,
                'Drift_Time_us': drift_time
            }
            
            if classification_result:
                anomaly_entry['AI_Classification'] = classification_result['classification']
                anomaly_entry['AI_Confidence'] = classification_result['confidence']
                anomaly_entry['AI_Reasoning'] = classification_result['reasoning']
            
            anomaly_entry['Flags_Detail'] = json.dumps(anomaly_flags)
            anomalies.append(anomaly_entry)
    
    print(f"\nCompleted analysis of {processed} events")
    
    if not anomalies:
        print("\nNo significant anomalies detected!")
        return pd.DataFrame()
    
    anomalies_df = pd.DataFrame(anomalies)
    anomalies_df = anomalies_df.sort_values('Anomaly_Score', ascending=False)
    
    return anomalies_df


def generate_anomaly_report(anomalies_df: pd.DataFrame, output_file: Path):
    """
    Generate a comprehensive scientific anomaly detection report
    Clearly answers: What? How bad? Why? What to do?
    """
    with open(output_file, 'w', encoding='utf-8') as f:
        # Header
        f.write("="*80 + "\n")
        f.write("SCIENTIFIC ANOMALY DETECTION REPORT\n")
        f.write("Dark Matter Event Analysis with AI Classification\n")
        f.write("="*80 + "\n\n")
        
        # Executive Summary
        f.write("EXECUTIVE SUMMARY\n")
        f.write("-" * 80 + "\n")
        f.write(f"Total Anomalies Detected: {len(anomalies_df)}\n")
        f.write(f"Anomaly Type: Point Anomalies (Individual events deviating from norm)\n\n")
        
        # Severity Analysis
        f.write("SEVERITY BREAKDOWN\n")
        f.write("-" * 80 + "\n")
        severity_counts = anomalies_df['Severity'].value_counts()
        for severity in ['Critical', 'High', 'Medium']:
            count = severity_counts.get(severity, 0)
            if count > 0:
                urgency = {
                    'Critical': 'IMMEDIATE ATTENTION REQUIRED',
                    'High': 'Priority Review Needed',
                    'Medium': 'Standard Review Recommended'
                }
                f.write(f"  {severity:12s}: {count:5d} events - {urgency[severity]}\n")
        f.write("\n")
        
        # Classification Summary (if AI was used)
        if 'AI_Classification' in anomalies_df.columns:
            f.write("CLASSIFICATION SUMMARY\n")
            f.write("-" * 80 + "\n")
            class_counts = anomalies_df['AI_Classification'].value_counts()
            for cls, count in class_counts.items():
                f.write(f"  {cls:25s}: {count:5d} events\n")
            f.write("\n")
        
        # Detailed Analysis - Top Anomalies
        f.write("="*80 + "\n")
        f.write("DETAILED ANOMALY ANALYSIS (Top 10 by Score)\n")
        f.write("="*80 + "\n\n")
        
        for idx, (_, row) in enumerate(anomalies_df.head(10).iterrows(), 1):
            f.write(f"{'='*80}\n")
            f.write(f"ANOMALY #{idx} - Event ID: {row['Event_ID']}\n")
            f.write(f"{'='*80}\n\n")
            
            # WHAT IS THE ANOMALY?
            f.write("1. WHAT IS THE ANOMALY?\n")
            f.write("-" * 80 + "\n")
            f.write(f"   Event Identifier:  {row['Event_ID']}\n")
            f.write(f"   Anomaly Type:      Point Anomaly (Single Deviant Event)\n")
            if 'AI_Classification' in row:
                f.write(f"   Classification:    {row['AI_Classification']}\n")
            f.write("\n")
            
            # HOW BAD IS IT?
            f.write("2. HOW BAD IS IT? (Severity Assessment)\n")
            f.write("-" * 80 + "\n")
            f.write(f"   Severity Level:    {row['Severity']}\n")
            f.write(f"   Anomaly Score:     {row['Anomaly_Score']:.3f} / 1.000\n")
            f.write(f"   Flags Triggered:   {row['Num_Flags']} violation(s)\n")
            
            # Score interpretation
            score = row['Anomaly_Score']
            if score > 0.7:
                interpretation = "CRITICAL - Multiple severe violations detected"
            elif score > 0.5:
                interpretation = "HIGH - Significant deviation from expected behavior"
            elif score > 0.3:
                interpretation = "MEDIUM - Notable anomaly requiring investigation"
            else:
                interpretation = "LOW - Minor deviation from norm"
            f.write(f"   Interpretation:    {interpretation}\n")
            
            if 'AI_Confidence' in row:
                conf = row['AI_Confidence']
                conf_level = "High" if conf > 0.7 else "Medium" if conf > 0.4 else "Low"
                f.write(f"   AI Confidence:     {conf:.1%} ({conf_level})\n")
            f.write("\n")
            
            # WHY IS IT AN ANOMALY?
            f.write("3. WHY IS IT AN ANOMALY? (Root Cause Analysis)\n")
            f.write("-" * 80 + "\n")
            
            # Event characteristics
            f.write("   Event Characteristics:\n")
            f.write(f"     • Energy:        {row['Energy_keV']:.3f} keV\n")
            f.write(f"     • S2/S1 Ratio:   {row['S2_S1_Ratio']}\n")
            f.write(f"     • Position:      ({row['Position_X']:.1f}, {row['Position_Y']:.1f}) mm\n")
            f.write(f"     • Drift Time:    {row['Drift_Time_us']:.1f} μs\n\n")
            
            # Detailed flags
            f.write("   Violation Details:\n")
            flags = json.loads(row['Flags_Detail'])
            for flag_idx, flag in enumerate(flags, 1):
                f.write(f"     [{flag_idx}] {flag['type']}\n")
                f.write(f"         Severity:    {flag['severity'].upper()}\n")
                f.write(f"         Value:       {flag['value']}\n")
                f.write(f"         Weight:      {flag['weight']:.2f}\n\n")
            
            # AI Reasoning
            if 'AI_Reasoning' in row and row['AI_Reasoning']:
                f.write("   AI Expert Analysis:\n")
                reasoning_lines = str(row['AI_Reasoning']).replace('. ', '.\n     ')
                f.write(f"     {reasoning_lines}\n\n")
            
            # WHAT SHOULD I DO?
            f.write("4. WHAT SHOULD I DO? (Recommended Action)\n")
            f.write("-" * 80 + "\n")
            
            # Determine action based on severity and flags
            flags_text = json.loads(row['Flags_Detail'])
            has_data_quality = any('Missing' in f['type'] or 'Low AI Confidence' in f['type'] for f in flags_text)
            has_physics = any('Energy' in f['type'] or 'S2/S1' in f['type'] for f in flags_text)
            
            if has_data_quality:
                f.write("   ⚠️  DATA QUALITY ISSUE DETECTED\n")
                f.write("   Action: EXCLUDE from physics analysis\n")
                f.write("   Reason: Missing or corrupt data - not a dark matter signal\n")
                f.write("   Next Steps:\n")
                f.write("     1. Flag event for data quality review\n")
                f.write("     2. Remove from scientific analysis dataset\n")
                f.write("     3. Investigate detector/DAQ issues if recurring\n")
            elif row['Severity'] == 'Critical':
                f.write("   🔴 CRITICAL ANOMALY - PRIORITY INVESTIGATION\n")
                f.write("   Action: IMMEDIATE manual review required\n")
                f.write("   Reason: Extreme deviation suggesting novel physics or system failure\n")
                f.write("   Next Steps:\n")
                f.write("     1. Expert physicist review within 24 hours\n")
                f.write("     2. Cross-reference with detector calibration data\n")
                f.write("     3. Consider for publication if novel physics candidate\n")
            elif has_physics:
                f.write("   🟡 PHYSICS ANOMALY - STANDARD REVIEW\n")
                f.write("   Action: Include in anomaly catalog for detailed study\n")
                f.write("   Reason: Unusual but valid event - potential signal\n")
                f.write("   Next Steps:\n")
                f.write("     1. Add to candidate event list\n")
                f.write("     2. Apply additional background rejection cuts\n")
                f.write("     3. Statistical analysis of similar events\n")
            else:
                f.write("   ℹ️  STANDARD ANOMALY - ROUTINE REVIEW\n")
                f.write("   Action: Log for periodic review\n")
                f.write("   Next Steps:\n")
                f.write("     1. Include in weekly anomaly summary\n")
                f.write("     2. Monitor for patterns\n")
            
            f.write("\n" + "="*80 + "\n\n")
        
        # Footer
        f.write("="*80 + "\n")
        f.write("END OF ANOMALY REPORT\n")
        f.write("="*80 + "\n")
        f.write("\nREPORT LEGEND:\n")
        f.write("  • Point Anomaly: Individual event that deviates from expected behavior\n")
        f.write("  • Anomaly Score: Weighted sum of violation flags (0.0 - 1.0)\n")
        f.write("  • Severity: Critical (>0.7) | High (>0.5) | Medium (>0.3)\n")
        f.write("  • Data Quality Issue: Missing data, low confidence - EXCLUDE\n")
        f.write("  • Physics Anomaly: Unusual but valid event - INVESTIGATE\n")
        f.write("="*80 + "\n")
    
    # File saved silently - no terminal notification


def print_detailed_report_to_terminal(anomalies_df: pd.DataFrame):
    """
    Print comprehensive scientific anomaly report directly to terminal
    Shows ALL anomalies, same as the file report
    """
    print("\n" + "="*80)
    print("SCIENTIFIC ANOMALY DETECTION REPORT")
    print("Dark Matter Event Analysis with AI Classification")
    print("="*80 + "\n")
    
    # Executive Summary
    print("EXECUTIVE SUMMARY")
    print("-" * 80)
    print(f"Total Anomalies Detected: {len(anomalies_df)}")
    print(f"Anomaly Type: Point Anomalies (Individual events deviating from norm)\n")
    
    # Severity Analysis
    print("SEVERITY BREAKDOWN")
    print("-" * 80)
    severity_counts = anomalies_df['Severity'].value_counts()
    for severity in ['Critical', 'High', 'Medium']:
        count = severity_counts.get(severity, 0)
        if count > 0:
            urgency = {
                'Critical': 'IMMEDIATE ATTENTION REQUIRED',
                'High': 'Priority Review Needed',
                'Medium': 'Standard Review Recommended'
            }
            print(f"  {severity:12s}: {count:5d} events - {urgency[severity]}")
    print()
    
    # Classification Summary (if AI was used)
    if 'AI_Classification' in anomalies_df.columns:
        print("CLASSIFICATION SUMMARY")
        print("-" * 80)
        class_counts = anomalies_df['AI_Classification'].value_counts()
        for cls, count in class_counts.items():
            print(f"  {cls:25s}: {count:5d} events")
        print()
    
    # Detailed Analysis - Show TOP 10 ANOMALIES (changed from 5 to 10)
    num_to_show = min(10, len(anomalies_df))
    print("="*80)
    print(f"DETAILED ANOMALY ANALYSIS (Top {num_to_show} by Score)")
    print("="*80 + "\n")
    
    for idx, (_, row) in enumerate(anomalies_df.head(num_to_show).iterrows(), 1):
        print(f"{'='*80}")
        print(f"ANOMALY #{idx} - Event ID: {row['Event_ID']}")
        print(f"{'='*80}\n")
        
        # WHAT IS THE ANOMALY?
        print("1. WHAT IS THE ANOMALY?")
        print("-" * 80)
        print(f"   Event Identifier:  {row['Event_ID']}")
        print(f"   Anomaly Type:      Point Anomaly (Single Deviant Event)")
        if 'AI_Classification' in row:
            print(f"   Classification:    {row['AI_Classification']}")
        print()
        
        # HOW BAD IS IT?
        print("2. HOW BAD IS IT? (Severity Assessment)")
        print("-" * 80)
        print(f"   Severity Level:    {row['Severity']}")
        print(f"   Anomaly Score:     {row['Anomaly_Score']:.3f} / 1.000")
        print(f"   Flags Triggered:   {row['Num_Flags']} violation(s)")
        
        # Score interpretation
        score = row['Anomaly_Score']
        if score > 0.7:
            interpretation = "CRITICAL - Multiple severe violations detected"
        elif score > 0.5:
            interpretation = "HIGH - Significant deviation from expected behavior"
        elif score > 0.3:
            interpretation = "MEDIUM - Notable anomaly requiring investigation"
        else:
            interpretation = "LOW - Minor deviation from norm"
        print(f"   Interpretation:    {interpretation}")
        
        if 'AI_Confidence' in row:
            conf = row['AI_Confidence']
            conf_level = "High" if conf > 0.7 else "Medium" if conf > 0.4 else "Low"
            print(f"   AI Confidence:     {conf:.1%} ({conf_level})")
        print()
        
        # WHY IS IT AN ANOMALY?
        print("3. WHY IS IT AN ANOMALY? (Root Cause Analysis)")
        print("-" * 80)
        
        # Event characteristics
        print("   Event Characteristics:")
        print(f"     • Energy:        {row['Energy_keV']:.3f} keV")
        print(f"     • S2/S1 Ratio:   {row['S2_S1_Ratio']}")
        print(f"     • Position:      ({row['Position_X']:.1f}, {row['Position_Y']:.1f}) mm")
        print(f"     • Drift Time:    {row['Drift_Time_us']:.1f} μs\n")
        
        # Detailed flags
        print("   Violation Details:")
        flags = json.loads(row['Flags_Detail'])
        for flag_idx, flag in enumerate(flags, 1):
            print(f"     [{flag_idx}] {flag['type']}")
            print(f"         Severity:    {flag['severity'].upper()}")
            print(f"         Value:       {flag['value']}")
            print(f"         Weight:      {flag['weight']:.2f}\n")
        
        # AI Reasoning
        if 'AI_Reasoning' in row and row['AI_Reasoning']:
            print("   AI Expert Analysis:")
            reasoning = str(row['AI_Reasoning'])
            # Wrap text at 70 characters
            import textwrap
            wrapped = textwrap.fill(reasoning, width=70, initial_indent='     ', subsequent_indent='     ')
            print(f"{wrapped}\n")
        
        # WHAT SHOULD I DO?
        print("4. WHAT SHOULD I DO? (Recommended Action)")
        print("-" * 80)
        
        # Determine action based on severity and flags
        flags_text = json.loads(row['Flags_Detail'])
        has_data_quality = any('Missing' in f['type'] or 'Low AI Confidence' in f['type'] for f in flags_text)
        has_physics = any('Energy' in f['type'] or 'S2/S1' in f['type'] for f in flags_text)
        
        if has_data_quality:
            print("   ⚠️  DATA QUALITY ISSUE DETECTED")
            print("   Action: EXCLUDE from physics analysis")
            print("   Reason: Missing or corrupt data - not a dark matter signal")
            print("   Next Steps:")
            print("     1. Flag event for data quality review")
            print("     2. Remove from scientific analysis dataset")
            print("     3. Investigate detector/DAQ issues if recurring")
        elif row['Severity'] == 'Critical':
            print("   🔴 CRITICAL ANOMALY - PRIORITY INVESTIGATION")
            print("   Action: IMMEDIATE manual review required")
            print("   Reason: Extreme deviation suggesting novel physics or system failure")
            print("   Next Steps:")
            print("     1. Expert physicist review within 24 hours")
            print("     2. Cross-reference with detector calibration data")
            print("     3. Consider for publication if novel physics candidate")
        elif has_physics:
            print("   🟡 PHYSICS ANOMALY - STANDARD REVIEW")
            print("   Action: Include in anomaly catalog for detailed study")
            print("   Reason: Unusual but valid event - potential signal")
            print("   Next Steps:")
            print("     1. Add to candidate event list")
            print("     2. Apply additional background rejection cuts")
            print("     3. Statistical analysis of similar events")
        else:
            print("   ℹ️  STANDARD ANOMALY - ROUTINE REVIEW")
            print("   Action: Log for periodic review")
            print("   Next Steps:")
            print("     1. Include in weekly anomaly summary")
            print("     2. Monitor for patterns")
        
        print("\n" + "="*80 + "\n")
    
    # Show info about remaining anomalies if more than 10
    if len(anomalies_df) > num_to_show:
        print(f"... and {len(anomalies_df) - num_to_show} more anomalies")
        print(f"See full report file for complete details\n")
    
    # Footer
    print("="*80)
    print("END OF ANOMALY REPORT")
    print("="*80)
    print("\nREPORT LEGEND:")
    print("  • Point Anomaly: Individual event that deviates from expected behavior")
    print("  • Anomaly Score: Weighted sum of violation flags (0.0 - 1.0)")
    print("  • Severity: Critical (>0.7) | High (>0.5) | Medium (>0.3)")
    print("  • Data Quality Issue: Missing data, low confidence - EXCLUDE")
    print("  • Physics Anomaly: Unusual but valid event - INVESTIGATE")
    print("="*80 + "\n")


def main():
    """Main function to run anomaly detection"""
    parser = argparse.ArgumentParser(
        description='Advanced Anomaly Detection for Dark Matter Events'
    )
    parser.add_argument(
        '--num-events',
        type=int,
        default=None,
        help='Number of events to analyze (default: all)'
    )
    parser.add_argument(
        '--no-claude',
        action='store_true',
        help='Skip Claude AI classification (faster but less intelligent)'
    )
    parser.add_argument(
        '--threshold',
        type=float,
        default=0.3,
        help='Anomaly score threshold (default: 0.3)'
    )
    
    args = parser.parse_args()
    
    print("\n" + "#"*80)
    print("DARK MATTER ANOMALY DETECTION SYSTEM")
    print("Using Claude AI for Intelligent Analysis")
    print("#"*80 + "\n")
    
    # Load dataset
    print(f"Loading dataset from: {CSV_PATH}")
    if not CSV_PATH.exists():
        print(f"\nERROR: Dataset not found at {CSV_PATH}")
        print("Please generate the dataset first:")
        print("  cd ../Python_Files")
        print("  python mainDatasetCreation.py")
        sys.exit(1)
    
    df = pd.read_csv(CSV_PATH)
    print(f"✓ Loaded {len(df)} events")
    
    # Filter to only events with valid S2/S1 data for physics analysis
    total_events = len(df)
    df_valid = df[df['s2_over_s1_ratio'].notna()].copy()
    print(f"✓ Valid S2/S1 data: {len(df_valid)} events ({len(df_valid)/total_events*100:.1f}%)")
    print(f"⚠️  Filtered out: {total_events - len(df_valid)} events with missing S2/S1\n")
    
    if df_valid.empty:
        print("ERROR: No valid events to analyze!")
        sys.exit(1)
    
    # Use the filtered dataset
    df = df_valid
    
    # Run anomaly detection
    use_claude = not args.no_claude
    
    if use_claude:
        print("🤖 Claude AI classification: ENABLED")
        print("⚠️  Note: This will make API calls and may take time\n")
    else:
        print("🤖 Claude AI classification: DISABLED")
        print("⚡ Using fast rule-based detection only\n")
    
    anomalies_df = detect_anomalies_advanced(
        df, 
        use_claude=use_claude,
        max_events=args.num_events,
        threshold=args.threshold
    )
    
    if anomalies_df.empty:
        print("\n✓ No significant anomalies detected!")
        return
    
    # Save results
    csv_output = RESULTS_DIR / 'detected_anomalies_detailed.csv'
    json_output = RESULTS_DIR / 'detected_anomalies_detailed.json'
    report_output = ANOMALY_REPORTS_DIR / 'anomaly_detection_report.txt'
    
    # Display detailed report in terminal
    print_detailed_report_to_terminal(anomalies_df)
    
    # Save to files silently (no notification)
    anomalies_df.to_csv(csv_output, index=False)
    anomalies_df.to_json(json_output, orient='records', indent=2)
    generate_anomaly_report(anomalies_df, report_output)
    
    # Print final summary
    print("\n" + "="*80)
    print("ANOMALY DETECTION COMPLETE")
    print("="*80 + "\n")
    
    print(f"📊 Summary:")
    print(f"   Total Events Analyzed:  {len(df) if args.num_events is None else args.num_events}")
    print(f"   Anomalies Detected:     {len(anomalies_df)}")
    print(f"   Detection Rate:         {len(anomalies_df)/len(df)*100:.2f}%\n")
    
    print(f"Severity Breakdown:")
    for severity in ['Critical', 'High', 'Medium']:
        count = anomalies_df[anomalies_df['Severity'] == severity].shape[0]
        if count > 0:
            urgency = {
                'Critical': '🔴 IMMEDIATE ATTENTION',
                'High': '🟡 PRIORITY REVIEW',
                'Medium': 'ℹ️  STANDARD REVIEW'
            }
            print(f"   {severity:12s}: {count:5d} events - {urgency[severity]}")
    
    print("\n" + "="*80 + "\n")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Analysis interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
