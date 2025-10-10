#!/usr/bin/env python3
"""main_api_classifier.py - Advanced AI classifier using Gemini/Claude API.

This script loads the synthetic dataset, filters for the most promising candidates,
and calls the specified LLM (Gemini/Claude) for detailed classification and
scientific reasoning. This minimizes token usage by only analyzing selected events.
"""
import argparse
import json
import os
import sys
import time
import re
from typing import Any, Dict, List

import pandas as pd
# Use the Python 'requests' library for the HTTP API call
import requests
from dotenv import load_dotenv
import anthropic

# Load environment variables from .env file
load_dotenv()

# --- API Configuration ---
# API key is now loaded from .env file for security
API_KEY = os.getenv("CLAUDE_API_KEY")
if not API_KEY:
    raise ValueError("CLAUDE_API_KEY not found in environment variables. Please set it in .env file.")

MODEL_NAME = "claude-3-haiku-20240307"  # Claude Haiku model

CSV = 'dataset/dark_matter_synthetic_dataset.csv'

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description='Classify candidate events using Gemini/Claude API')
    p.add_argument('--num-events', type=int, default=10, help='Number of events to classify using the API')
    p.add_argument('--generate-hypotheses', action='store_true', help='Generate physics hypotheses for anomalous events')
    p.add_argument('--top-anomalies', type=int, default=10, help='Number of top anomalies to analyze')
    return p.parse_args()


def create_api_prompt_and_schema(event_data: Dict[str, Any]) -> tuple:
    """
    Creates a detailed, structured prompt and JSON schema to guide the LLM's reasoning
    based on the updated S2/S1 classification bands with enhanced physics-based analysis.
    """
    
    # Select only the most relevant physics features to minimize input tokens
    features = {
        'event_id': event_data.get('event_id'),
        'recoil_energy_keV': event_data.get('recoil_energy_keV'),
        's1_area_PE': event_data.get('s1_area_PE'),
        's2_area_PE': event_data.get('s2_area_PE'),
        's2_over_s1_ratio': event_data.get('s2_over_s1_ratio'),
        'log10_s2_over_s1': event_data.get('log10_s2_over_s1'),
        'position_x_mm': event_data.get('position_x_mm'),
        'position_y_mm': event_data.get('position_y_mm'),
        'position_z_mm': event_data.get('position_z_mm'),
        'drift_time_us': event_data.get('drift_time_us'),
        's1_width_ns': event_data.get('s1_width_ns'),
        's2_width_us': event_data.get('s2_width_us'),
        'event_quality': event_data.get('event_quality'),
        'pile_up_flag': event_data.get('pile_up_flag'),
        'interaction_type': event_data.get('interaction_type'),
    }

    # System instruction for persona and structured output - ENHANCED WITH DETAILED PHYSICS
    system_prompt = (
        "You are a senior particle physicist at the XENONnT dark matter detection experiment. "
        "Your expertise includes liquid xenon TPCs, nuclear and electronic recoil discrimination, "
        "and statistical analysis of rare event searches.\n\n"
        
        "**CLASSIFICATION RULES (S2/S1 Ratio-Based):**\n"
        "1. **High S2/S1 (>200):** Background (Electronic Recoil - ER)\n"
        "   - Caused by gamma rays, beta decays, Compton scattering\n"
        "   - Higher ionization yield, more free electrons escape recombination\n"
        "   - Typical sources: Kr-85, Rn-222, detector materials\n\n"
        
        "2. **Medium S2/S1 (10-50):** WIMP-like (Nuclear Recoil - NR)\n"
        "   - Characteristic of WIMP-nucleus elastic scattering\n"
        "   - Lower ionization yield due to denser ionization tracks\n"
        "   - Energy typically 1-50 keV (WIMP search window)\n"
        "   - Must be single-scatter event in fiducial volume\n\n"
        
        "3. **Very Low S2/S1 (<10):** Axion-like or Exotic Signal\n"
        "   - Potentially axion-electron coupling or other exotic physics\n"
        "   - May show energy peaks at specific values (e.g., 14.4 keV for axions)\n"
        "   - Requires careful verification against detector artifacts\n\n"
        
        "**ADDITIONAL ANALYSIS FACTORS:**\n"
        "- **Energy Range:** WIMPs expected at 1-50 keV; backgrounds across full spectrum\n"
        "- **Position (Fiducialization):** Events near detector walls (z<50mm or z>1300mm) likely background\n"
        "- **Pulse Shape:** S1 width and S2 width can indicate event type\n"
        "- **Event Quality:** Quality <0.5 suggests detector noise or artifacts\n"
        "- **Pile-up Flag:** Multiple interactions increase background probability\n"
        "- **Drift Time:** Consistent with event position; anomalies suggest electronic noise\n\n"
        
        "**REASONING REQUIREMENTS:**\n"
        "Your reasoning MUST include:\n"
        "1. Quantitative S2/S1 ratio analysis with comparison to expected bands\n"
        "2. Energy assessment (is it in WIMP search window?)\n"
        "3. Position analysis (fiducial volume check)\n"
        "4. Pulse shape and timing considerations\n"
        "5. Comparison with known XENONnT/LUX-ZEPLIN published results\n"
        "6. Discussion of uncertainties and alternative interpretations\n"
        "7. Reference to relevant physics principles (recombination, quenching factors, etc.)"
    )

    # User query - ENHANCED WITH DETAILED INSTRUCTIONS FOR CLAUDE
    user_query = (
        f"**PARTICLE EVENT ANALYSIS REQUEST**\n\n"
        f"Analyze this dark matter detector event with rigorous scientific reasoning.\n\n"
        f"**EVENT DATA:**\n{json.dumps(features, indent=2)}\n\n"
        
        f"**ANALYSIS STEPS:**\n"
        f"1. Calculate and evaluate S2/S1 ratio against classification bands\n"
        f"2. Assess recoil energy in context of WIMP search (1-50 keV optimal)\n"
        f"3. Check fiducial volume position (x,y,z) - reject if near boundaries\n"
        f"4. Analyze pulse characteristics (widths, drift time consistency)\n"
        f"5. Evaluate event quality and pile-up indicators\n"
        f"6. Compare against known detector response and published results\n"
        f"7. Identify any anomalies or unusual features\n\n"
        
        f"**CLASSIFICATION OPTIONS:**\n"
        f"- 'Background (ER)' - Electronic recoil from gamma/beta radiation\n"
        f"- 'WIMP-like (NR)' - Nuclear recoil consistent with dark matter\n"
        f"- 'Axion-like (ER)' - Exotic signal with very low S2/S1\n"
        f"- 'Novel Anomaly' - Unusual event requiring further investigation\n\n"
        
        f"Provide comprehensive, multi-paragraph scientific reasoning with specific numerical references.\n\n"
        f"**CRITICAL FORMATTING REQUIREMENTS:**\n"
        f"- Your response must be ONLY a valid JSON object\n"
        f"- No markdown formatting, no code blocks, no extra text\n"
        f"- Use only printable ASCII characters in all text fields\n"
        f"- Escape any quotes within string values properly\n"
        f"- Do not use newlines or tabs within JSON string values\n"
        f"- Start your response with {{ and end with }}\n"
    )
    
    # JSON Schema definition for forced structured output - ENHANCED
    response_schema = {
        "type": "OBJECT",
        "properties": {
            "classification": {
                "type": "STRING", 
                "description": "The determined event type: 'Background (ER)', 'WIMP-like (NR)', 'Axion-like (ER)', or 'Novel Anomaly'"
            },
            "confidence": {
                "type": "NUMBER", 
                "description": "Confidence score from 0.0 to 1.0 based on how well event matches classification criteria"
            },
            "s2_s1_analysis": {
                "type": "STRING",
                "description": "Detailed analysis of S2/S1 ratio: numerical value, which band it falls in, comparison to expected ranges for each particle type, and what this indicates about the interaction physics"
            },
            "energy_analysis": {
                "type": "STRING",
                "description": "Analysis of recoil energy: is it in WIMP search window (1-50 keV)? Does it match known background lines? Any unusual energy signatures?"
            },
            "position_analysis": {
                "type": "STRING",
                "description": "Spatial analysis: is event in fiducial volume? Distance from walls? Any position-dependent backgrounds? Drift time consistency check"
            },
            "pulse_characteristics": {
                "type": "STRING",
                "description": "Analysis of S1/S2 pulse shapes, widths, and timing: do they match expected profiles for this particle type? Any anomalies?"
            },
            "physics_interpretation": {
                "type": "STRING",
                "description": "Deep physics reasoning: type of interaction (elastic scattering, Compton, photoelectric), recombination probability, quenching factors, comparison with detector calibration data"
            },
            "comparison_with_literature": {
                "type": "STRING",
                "description": "How does this event compare with published XENONnT, LUX-ZEPLIN, or PandaX results? Does it fit known background models or signal expectations?"
            },
            "alternative_interpretations": {
                "type": "STRING",
                "description": "What other particle types or detector effects could explain this event? Why were they ruled out or given lower probability?"
            },
            "confidence_factors": {
                "type": "STRING",
                "description": "What specific features increase or decrease classification confidence? What uncertainties remain?"
            },
            "follow_up_recommendations": {
                "type": "STRING",
                "description": "Specific, actionable suggestions for experimentalists: verification checks, cross-correlations, additional cuts, or further investigation needed"
            }
        },
        "required": [
            "classification", "confidence", "s2_s1_analysis", "energy_analysis", 
            "position_analysis", "pulse_characteristics", "physics_interpretation",
            "comparison_with_literature", "alternative_interpretations", 
            "confidence_factors", "follow_up_recommendations"
        ]
    }
    
    return system_prompt, user_query, response_schema


def classify_event_api(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Performs the API call to the Claude model for classification and reasoning.
    """
    system_prompt, user_query, response_schema = create_api_prompt_and_schema(event_data)
    
    try:
        # Initialize the Anthropic client
        client = anthropic.Anthropic(api_key=API_KEY)
        
        # Create the message using Claude's official client
        message = client.messages.create(
            model=MODEL_NAME,
            max_tokens=4000,
            temperature=0.0,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": f"{user_query}\n\nPlease respond with a valid JSON object that matches this schema: {json.dumps(response_schema)}"
                }
            ]
        )
        
        # Extract the response text
        if message.content and len(message.content) > 0:
            json_text = message.content[0].text
            
            # Clean the JSON text to remove control characters and fix formatting
            json_text = json_text.strip()
            
            # Remove any markdown code block formatting if present
            if json_text.startswith('```json'):
                json_text = json_text[7:]
            if json_text.startswith('```'):
                json_text = json_text[3:]
            if json_text.endswith('```'):
                json_text = json_text[:-3]
            
            # Remove control characters and clean the text
            import re
            json_text = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', json_text)
            json_text = json_text.strip()
            
            # Try to parse the cleaned JSON
            try:
                return json.loads(json_text)
            except json.JSONDecodeError as e:
                # If JSON parsing fails, try to extract just the content between braces
                brace_start = json_text.find('{')
                brace_end = json_text.rfind('}')
                if brace_start != -1 and brace_end != -1 and brace_end > brace_start:
                    clean_json = json_text[brace_start:brace_end+1]
                    try:
                        return json.loads(clean_json)
                    except json.JSONDecodeError:
                        pass
                
                # If all parsing fails, return a structured error response
                return {
                    "error": f"JSON parsing failed: {str(e)}",
                    "raw_text": json_text[:500] + "..." if len(json_text) > 500 else json_text,
                    "classification": "Background (ER)",  # Default classification
                    "confidence": 0.1,
                    "s2_s1_analysis": "Error in API response parsing",
                    "energy_analysis": "Error in API response parsing",
                    "position_analysis": "Error in API response parsing",
                    "pulse_characteristics": "Error in API response parsing",
                    "physics_interpretation": "Error in API response parsing",
                    "comparison_with_literature": "Error in API response parsing",
                    "alternative_interpretations": "Error in API response parsing",
                    "confidence_factors": "Error in API response parsing",
                    "follow_up_recommendations": "Review API response format"
                }
        
        # Handle cases where the model returns an error or empty content
        return {"error": "API response missing content.", "raw_response": str(message)}

    except anthropic.APIError as e:
        return {"error": f"Claude API Error: {e}"}
    except Exception as e:
        return {"error": f"Unexpected error: {e}"}
    except json.JSONDecodeError as e:
        # If decoding the main response fails, return what we have
        return {"error": f"JSON Decode Error in primary response: {e}", "raw_text": json_text if 'json_text' in locals() else 'No text available'}


def select_and_sample_events(df: pd.DataFrame, num_events: int) -> pd.DataFrame:
    """
    Selects a balanced sample of dark matter and background events for API testing.
    """
    df = df.copy()
    
    # Calculate S2/S1 locally if missing
    if 's2_over_s1_ratio' not in df.columns:
        df['s2_over_s1_ratio'] = df['s2_area_PE'] / df['s1_area_PE'].replace({0: pd.NA})

    # --- 1. Identify Signal Candidates (Non-Background) ---
    signal_candidates = df[df['label'] != 'Background'].dropna(subset=['s2_over_s1_ratio'])
    
    # --- 2. Identify True Background (Electronic Recoil) ---
    # Filter for clear background events (high S2/S1 is characteristic of background ER)
    # Using a threshold > 500 to guarantee a high S2/S1 event for comparison
    true_background = df[(df['label'] == 'Background') & (df['s2_over_s1_ratio'] > 500)].dropna(subset=['s2_over_s1_ratio'])

    # --- 3. Create a Balanced Sample for API Testing ---
    num_signal = min(num_events // 2, len(signal_candidates))
    num_background = min(num_events - num_signal, len(true_background))
    
    # Sample without replacement
    signal_sample = signal_candidates.sample(n=num_signal, random_state=42)
    background_sample = true_background.sample(n=num_background, random_state=42)
    
    # Combine and shuffle for a clean test batch
    test_sample = pd.concat([signal_sample, background_sample]).sample(frac=1, random_state=42)
    
    print(f"Sampling {len(test_sample)} events for API analysis (Signals: {num_signal}, Backgrounds: {num_background}).")
    return test_sample


def run_api_pipeline(df: pd.DataFrame, num_events: int) -> None:
    """
    Orchestrates the entire process: filtering, sampling, and API calling.
    """
    test_sample = select_and_sample_events(df, num_events=num_events)
    
    if test_sample.empty:
        print('No events selected for API analysis. Exiting.')
        return

    out: List[Dict[str, Any]] = []
    
    for _, row in test_sample.iterrows():
        evt = row.to_dict()
        
        # Ensure 'event_id' is present and not the pandas index
        if 'event_id' not in evt:
             evt['event_id'] = evt.get('index', 'UNKNOWN_ID')

        print(f"--- Analyzing Event {evt['event_id']} (True Label: {evt['label']}) ---")
        
        # This is where the token usage occurs
        api_analysis = classify_event_api(evt)
        
        # Append the analysis to the event data
        evt['api_analysis'] = api_analysis
        out.append(evt)
        
        # Print the key results directly - ENHANCED OUTPUT
        if isinstance(api_analysis, dict) and 'classification' in api_analysis:
            print(f"\n{'='*70}")
            print(f"CLASSIFICATION: {api_analysis['classification']}")
            print(f"CONFIDENCE: {api_analysis['confidence']:.2f}")
            print(f"{'='*70}")
            
            # Print all reasoning sections
            reasoning_sections = [
                ('S2/S1 ANALYSIS', api_analysis.get('s2_s1_analysis')),
                ('ENERGY ANALYSIS', api_analysis.get('energy_analysis')),
                ('POSITION ANALYSIS', api_analysis.get('position_analysis')),
                ('PULSE CHARACTERISTICS', api_analysis.get('pulse_characteristics')),
                ('PHYSICS INTERPRETATION', api_analysis.get('physics_interpretation')),
                ('COMPARISON WITH LITERATURE', api_analysis.get('comparison_with_literature')),
                ('ALTERNATIVE INTERPRETATIONS', api_analysis.get('alternative_interpretations')),
                ('CONFIDENCE FACTORS', api_analysis.get('confidence_factors')),
                ('FOLLOW-UP RECOMMENDATIONS', api_analysis.get('follow_up_recommendations'))
            ]
            
            for section_name, content in reasoning_sections:
                if content:
                    print(f"\n{section_name}:")
                    print(f"{content}")
            
            print(f"\n{'='*70}\n")
        else:
            print(f"API Error or Malformed Response: {api_analysis}")
            
        # Wait to respect rate limits and manage costs
        time.sleep(2) 

    # Save the final results
    output_filename = 'dataset/claude_classified_results_detailed.json'
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f'\nPipeline complete. Detailed results saved to {output_filename}')
    
    return out  # Return classified events for hypothesis generation


def main() -> None:
    args = parse_args()
    try:
        df = pd.read_csv(CSV)
    except FileNotFoundError:
        print(f'Error: {CSV} not found. Ensure the dataset is in the current directory.')
        sys.exit(1)

    # Ensure event_id is a column for consistent tracking
    if 'event_id' not in df.columns:
        df = df.reset_index().rename(columns={'index': 'event_id'})

    # Run classification pipeline
    classified_events = run_api_pipeline(df, num_events=args.num_events)
    
    # Optionally run hypothesis generation for anomalies
    if args.generate_hypotheses:
        print(f"\n{'='*80}")
        print("Starting Physics-Based Hypothesis Generation...")
        print(f"{'='*80}\n")
        run_hypothesis_generation(classified_events, top_n=args.top_anomalies)
    else:
        print("\n💡 Tip: Use --generate-hypotheses to analyze anomalous events")
        print("   Example: python mainClassify.py --num-events 20 --generate-hypotheses --top-anomalies 5")


if __name__ == '__main__':
    main()


# ==================== PHYSICS-BASED HYPOTHESIS GENERATION ====================

def identify_anomalies(classified_events: List[Dict[str, Any]], anomaly_threshold: float = 0.5) -> List[Dict[str, Any]]:
    """
    Identify anomalous events based on classification confidence and unusual features.
    """
    anomalies = []
    
    for evt in classified_events:
        api_analysis = evt.get('api_analysis', {})
        classification = api_analysis.get('classification', '')
        confidence = api_analysis.get('confidence', 1.0)
        
        # Calculate anomaly score based on various factors
        anomaly_score = 0.0
        flags = []
        
        # Low confidence is suspicious
        if confidence < 0.7:
            anomaly_score += (0.7 - confidence)
            flags.append({
                'type': 'Low Confidence',
                'value': f'{confidence:.2f}',
                'severity': 'medium'
            })
        
        # Novel Anomaly classification
        if 'Novel' in classification or 'Anomaly' in classification:
            anomaly_score += 0.5
            flags.append({
                'type': 'Novel Classification',
                'value': classification,
                'severity': 'high'
            })
        
        # Unusual S2/S1 ratio
        s2_s1 = evt.get('s2_over_s1_ratio', 0)
        if s2_s1 > 0:
            if s2_s1 < 5 or s2_s1 > 1000:
                anomaly_score += 0.3
                flags.append({
                    'type': 'Unusual S2/S1 Ratio',
                    'value': f'{s2_s1:.2f}',
                    'severity': 'high' if s2_s1 < 5 else 'medium'
                })
        
        # Energy outside WIMP search window but not clear background
        energy = evt.get('recoil_energy_keV', 0)
        if energy > 0:
            if (energy < 1 or energy > 100) and 'Background' not in classification:
                anomaly_score += 0.2
                flags.append({
                    'type': 'Unusual Energy',
                    'value': f'{energy:.2f} keV',
                    'severity': 'medium'
                })
        
        # Poor event quality
        quality = evt.get('event_quality', 1.0)
        if quality < 0.5:
            anomaly_score += 0.2
            flags.append({
                'type': 'Poor Event Quality',
                'value': f'{quality:.2f}',
                'severity': 'low'
            })
        
        # Pile-up events
        if evt.get('pile_up_flag', 0) > 0:
            anomaly_score += 0.15
            flags.append({
                'type': 'Pile-up Detected',
                'value': 'True',
                'severity': 'medium'
            })
        
        # If anomaly score exceeds threshold, mark as anomaly
        if anomaly_score >= anomaly_threshold or len(flags) >= 2:
            severity = 'high' if anomaly_score > 0.8 else 'medium' if anomaly_score > 0.5 else 'low'
            
            anomalies.append({
                'Event_ID': evt.get('event_id', 'UNKNOWN'),
                'Classification': classification,
                'Confidence': confidence,
                'Anomaly_Score': round(anomaly_score, 3),
                'Severity': severity,
                'Flags': flags,
                'Event_Data': {
                    'Energy_keV': energy,
                    'S1': evt.get('s1_area_PE', 0),
                    'S2': evt.get('s2_area_PE', 0),
                    'S2_S1_Ratio': s2_s1,
                    'Pulse_Shape': evt.get('interaction_type', 'Unknown'),
                    'Position_X': evt.get('position_x_mm', 0),
                    'Position_Y': evt.get('position_y_mm', 0),
                    'Position_Z': evt.get('position_z_mm', 0),
                    'Timestamp': evt.get('event_id', 'N/A'),
                    'Quality': quality,
                    'Pile_up': evt.get('pile_up_flag', 0)
                }
            })
    
    # Sort by anomaly score (highest first)
    anomalies.sort(key=lambda x: x['Anomaly_Score'], reverse=True)
    
    return anomalies


def generate_physics_hypotheses(anomaly: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate 3 physics-based hypotheses for each anomalous event using Claude API.
    """
    
    event = anomaly['Event_Data']
    flags = anomaly['Flags']
    
    flags_description = "\n".join([
        f"- {f['type']}: {f['value']} (severity: {f['severity']})"
        for f in flags
    ])
    
    prompt = f"""You are a particle physicist investigating an anomalous detector event.

EVENT DETAILS:
- Event ID: {event['Event_ID']}
- Classification: {anomaly['Classification']} (Confidence: {anomaly['Confidence']:.2f})
- Anomaly Score: {anomaly['Anomaly_Score']:.2f}
- Severity: {anomaly['Severity']}

ANOMALOUS FEATURES:
{flags_description}

FULL EVENT DATA:
- Energy: {event['Energy_keV']} keV
- S1: {event['S1']} PE
- S2: {event['S2']} PE
- S2/S1 Ratio: {event['S2_S1_Ratio']}
- Pulse Shape: {event['Pulse_Shape']}
- Position: ({event['Position_X']:.1f}, {event['Position_Y']:.1f}, {event['Position_Z']:.1f}) mm
- Quality: {event['Quality']:.2f}
- Pile-up Flag: {event['Pile_up']}

Provide THREE physics-based hypotheses ranked by likelihood. Output must be ONLY valid JSON.

Required JSON structure:
{{
  "event_id": "{event['Event_ID']}",
  "anomaly_summary": "Brief description of why this is anomalous",
  "hypothesis_1": {{
    "name": "Most Likely Explanation",
    "probability": "60-80%",
    "mechanism": "Physical mechanism description",
    "explanation": "Why this explains the anomaly",
    "precedents": "Known precedents from experiments",
    "verification": "How to verify this hypothesis",
    "expected_signatures": "What else should we see if this is true",
    "discriminating_tests": "How to distinguish from other hypotheses"
  }},
  "hypothesis_2": {{
    "name": "Alternative Hypothesis",
    "probability": "20-40%",
    "mechanism": "Different physical interpretation",
    "explanation": "Supporting evidence for this hypothesis",
    "differences": "How it differs from hypothesis 1",
    "verification": "Verification method",
    "expected_signatures": "Expected additional signatures",
    "discriminating_tests": "Tests to distinguish this hypothesis"
  }},
  "hypothesis_3": {{
    "name": "Exotic/Novel Physics",
    "probability": "5-20%",
    "mechanism": "Unusual or unexpected explanation",
    "explanation": "Why standard physics might not apply",
    "implications": "Implications if true",
    "testing": "How to test this hypothesis",
    "expected_signatures": "Unique signatures to look for",
    "discriminating_tests": "Critical tests needed"
  }},
  "immediate_actions": ["Action 1", "Action 2", "Action 3"],
  "data_requirements": ["Requirement 1", "Requirement 2"],
  "literature_references": ["Reference 1", "Reference 2"],
  "recommended_priority": "high/medium/low"
}}

CRITICAL: Return ONLY the JSON object, no markdown, no code blocks, no extra text."""

    try:
        # Initialize the Anthropic client
        client = anthropic.Anthropic(api_key=API_KEY)
        
        # Create the message using Claude
        message = client.messages.create(
            model=MODEL_NAME,
            max_tokens=3500,
            temperature=0.0,
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Extract and clean the response
        if message.content and len(message.content) > 0:
            json_text = message.content[0].text
            
            # Clean the JSON text
            json_text = json_text.strip()
            
            # Remove markdown code blocks if present
            if json_text.startswith('```json'):
                json_text = json_text[7:]
            if json_text.startswith('```'):
                json_text = json_text[3:]
            if json_text.endswith('```'):
                json_text = json_text[:-3]
            
            # Remove control characters
            json_text = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', json_text)
            json_text = json_text.strip()
            
            # Try to parse
            try:
                return json.loads(json_text)
            except json.JSONDecodeError as e:
                # Try to extract JSON between braces
                brace_start = json_text.find('{')
                brace_end = json_text.rfind('}')
                if brace_start != -1 and brace_end != -1:
                    clean_json = json_text[brace_start:brace_end+1]
                    try:
                        return json.loads(clean_json)
                    except:
                        pass
                
                # Return error with partial data
                return {
                    "error": f"JSON parsing failed: {str(e)}",
                    "event_id": event['Event_ID'],
                    "anomaly_summary": "Error generating hypotheses",
                    "raw_response": json_text[:500]
                }
        
        return {"error": "Empty response from API", "event_id": event['Event_ID']}
    
    except Exception as e:
        return {"error": f"API call failed: {str(e)}", "event_id": event['Event_ID']}


def run_hypothesis_generation(classified_events: List[Dict[str, Any]], top_n: int = 10) -> None:
    """
    Main pipeline for generating physics hypotheses for anomalous events.
    """
    print(f"\n{'='*80}")
    print("PHYSICS-BASED HYPOTHESIS GENERATION")
    print(f"{'='*80}\n")
    
    # Identify anomalies
    print("🔍 Identifying anomalous events...")
    anomalies = identify_anomalies(classified_events, anomaly_threshold=0.3)
    
    print(f"✅ Found {len(anomalies)} anomalous events")
    print(f"📊 Analyzing top {min(top_n, len(anomalies))} highest-priority anomalies...\n")
    
    # Create output directory
    import os
    os.makedirs('anomaly_analysis', exist_ok=True)
    
    # Generate hypotheses for top N anomalies
    all_hypotheses = []
    
    for idx, anomaly in enumerate(anomalies[:top_n], 1):
        print(f"\n{'='*80}")
        print(f"ANOMALY EVENT #{idx}: {anomaly['Event_ID']}")
        print(f"Severity: {anomaly['Severity'].upper()} | Anomaly Score: {anomaly['Anomaly_Score']:.2f}")
        print(f"{'='*80}")
        
        # Print anomaly flags
        print(f"\n🚩 ANOMALOUS FEATURES:")
        for flag in anomaly['Flags']:
            print(f"   • {flag['type']}: {flag['value']} (severity: {flag['severity']})")
        
        print(f"\n🤖 Generating physics hypotheses...")
        hypotheses = generate_physics_hypotheses(anomaly)
        
        if 'error' not in hypotheses:
            # Save to individual file
            filename = f"anomaly_analysis/event_{anomaly['Event_ID']}_hypotheses.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(hypotheses, f, indent=2, ensure_ascii=False)
            
            # Print summary
            print(f"\n✅ HYPOTHESIS SUMMARY:")
            print(f"\n📌 MOST LIKELY ({hypotheses.get('hypothesis_1', {}).get('probability', 'N/A')}):")
            print(f"   {hypotheses.get('hypothesis_1', {}).get('mechanism', 'N/A')}")
            
            print(f"\n📌 ALTERNATIVE ({hypotheses.get('hypothesis_2', {}).get('probability', 'N/A')}):")
            print(f"   {hypotheses.get('hypothesis_2', {}).get('mechanism', 'N/A')}")
            
            print(f"\n📌 EXOTIC ({hypotheses.get('hypothesis_3', {}).get('probability', 'N/A')}):")
            print(f"   {hypotheses.get('hypothesis_3', {}).get('mechanism', 'N/A')}")
            
            print(f"\n🎯 IMMEDIATE ACTIONS:")
            for action in hypotheses.get('immediate_actions', [])[:3]:
                print(f"   • {action}")
            
            print(f"\n💾 Saved to: {filename}")
            
            # Add to collection
            all_hypotheses.append({
                'anomaly': anomaly,
                'hypotheses': hypotheses
            })
        else:
            print(f"\n❌ Error: {hypotheses.get('error', 'Unknown error')}")
        
        # Rate limiting
        time.sleep(3)
    
    # Save comprehensive summary
    summary_file = 'anomaly_analysis/comprehensive_analysis.json'
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump({
            'analysis_date': time.strftime('%Y-%m-%d %H:%M:%S'),
            'total_events_analyzed': len(classified_events),
            'total_anomalies_found': len(anomalies),
            'hypotheses_generated': len(all_hypotheses),
            'anomalies': all_hypotheses
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*80}")
    print(f"✅ HYPOTHESIS GENERATION COMPLETE")
    print(f"{'='*80}")
    print(f"📊 Total anomalies identified: {len(anomalies)}")
    print(f"🔬 Hypotheses generated for: {len(all_hypotheses)} events")
    print(f"💾 Comprehensive analysis saved to: {summary_file}")
    print(f"📁 Individual analyses in: anomaly_analysis/ directory")
    print(f"{'='*80}\n")
