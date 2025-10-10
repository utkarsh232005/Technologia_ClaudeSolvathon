# #!/usr/bin/env python3
# """mainClassify.py - minimal local-only classifier

# This script selects candidate events from the synthetic dataset and applies a
# simple deterministic heuristic. It writes `classified_events_with_reasoning.json`.
# No external API calls are made.
# """
# import argparse
# import json
# import sys
# from typing import Any, Dict

# import pandas as pd


# CSV = 'dark_matter_synthetic_dataset.csv'


# def parse_args() -> argparse.Namespace:
#     p = argparse.ArgumentParser(description='Classify candidate events (local heuristic)')
#     p.add_argument('--num-events', type=int, default=5, help='Number of events to sample')
#     p.add_argument('--s2s1-threshold', type=float, default=500.0, help='S2/S1 upper threshold for candidate selection')
#     p.add_argument('--use-labels', action='store_true', help='Select candidates where label != Background')
#     return p.parse_args()


# def classify_event_local(evt: Dict[str, Any]) -> Dict[str, Any]:
#     try:
#         e = float(evt.get('recoil_energy_keV', float('nan')))
#     except Exception:
#         e = float('nan')

#     s1 = evt.get('s1_area_PE', 0)
#     s2 = evt.get('s2_area_PE', 0)
#     s2s1 = None
#     try:
#         s2s1 = float(s2) / max(float(s1), 1e-6)
#     except Exception:
#         s2s1 = None

#     label = 'Background'
#     confidence = 0.4
#     reasoning = []

#     if s2s1 is not None:
#         reasoning.append(f's2/s1={s2s1:.1f}')
#         if s2s1 < 500 and 1.0 < e < 60.0:
#             label = 'WIMP-like'
#             confidence = 0.6
#             reasoning.append('Low-ish S2/S1 and energy in WIMP search range')
#         else:
#             reasoning.append('High S2/S1 consistent with ER/background')

#     if abs(e - 14.4) <= 0.5:
#         label = 'Axion-like'
#         confidence = max(confidence, 0.85)
#         reasoning.append('Energy near 14.4 keV axion-like peak')

#     return {
#         'label': label,
#         'confidence': round(float(confidence), 3),
#         'reasoning': ' | '.join(reasoning) if reasoning else 'Insufficient data',
#         's2s1': s2s1,
#     }


# def select_candidates(df: pd.DataFrame, use_labels: bool, s2s1_threshold: float) -> pd.DataFrame:
#     df = df.copy()
#     if 's2_over_s1_ratio' not in df.columns:
#         df['s2_over_s1_ratio'] = df['s2_area_PE'] / df['s1_area_PE'].replace({0: pd.NA})

#     if use_labels and 'label' in df.columns:
#         return df[df['label'] != 'Background']

#     cand = df.dropna(subset=['s2_over_s1_ratio'])
#     cand = cand[(cand['s2_over_s1_ratio'] < s2s1_threshold) & (cand['recoil_energy_keV'] > 1.0) & (cand['recoil_energy_keV'] < 60.0)]
#     return cand


# def run_local_pipeline(df: pd.DataFrame, num_events: int, use_labels: bool, s2s1_threshold: float) -> None:
#     cands = select_candidates(df, use_labels=use_labels, s2s1_threshold=s2s1_threshold)
#     print(f'Found {len(cands)} potential candidates (use_labels={use_labels}, s2s1<{s2s1_threshold}).')
#     if cands.empty:
#         print('No candidate events to classify. Exiting.')
#         return

#     sample = cands.sample(n=min(num_events, len(cands)))
#     out = []
#     for _, row in sample.iterrows():
#         evt = row.to_dict()
#         evt['analysis'] = classify_event_local(evt)
#         out.append(evt)
#         print(f"Event {evt.get('event_id')}: {evt['analysis']['label']} (conf={evt['analysis']['confidence']})")

#     with open('classified_events_with_reasoning.json', 'w', encoding='utf-8') as f:
#         json.dump(out, f, indent=2, ensure_ascii=False)
#     print('Wrote classified_events_with_reasoning.json')


# def main() -> None:
#     args = parse_args()
#     try:
#         df = pd.read_csv(CSV)
#     except FileNotFoundError:
#         print(f'Error: {CSV} not found. Run main.py first to generate the dataset.')
#         sys.exit(1)

#     if 'event_id' not in df.columns:
#         df = df.reset_index().rename(columns={'index': 'event_id'})

#     run_local_pipeline(df, num_events=args.num_events, use_labels=args.use_labels, s2s1_threshold=args.s2s1_threshold)


# if __name__ == '__main__':
#     main()

#!/usr/bin/env python3
# """main_api_classifier.py - Advanced AI classifier using Gemini/Claude API.

# This script loads the synthetic dataset, filters for the most promising candidates,
# and calls the specified LLM (Gemini/Claude) for detailed classification and
# scientific reasoning. This minimizes token usage by only analyzing selected events.
# """
# import argparse
# import json
# import os
# import sys
# import time
# from typing import Any, Dict, List

# import pandas as pd
# # Use the Python 'requests' library for the HTTP API call
# import requests

# # --- API Configuration (REMOVED - Now using environment variables) ---
# NOTE: All API configuration has been moved to use environment variables for security.
# See .env.example and ENV_SETUP.md for setup instructions.

# CSV = 'dark_matter_synthetic_dataset.csv'

# def parse_args() -> argparse.Namespace:
#     p = argparse.ArgumentParser(description='Classify candidate events using Gemini/Claude API')
#     p.add_argument('--num-events', type=int, default=10, help='Number of events to classify using the API')
#     return p.parse_args()


# def create_api_prompt_and_schema(event_data: Dict[str, Any]) -> tuple:
#     """
#     Creates a detailed, structured prompt and JSON schema to guide the LLM's reasoning.
    
#     This prompt is designed for DETAILED reasoning while maintaining token efficiency
#     by giving Claude/Gemini a clear role and fixed output structure.
#     """
    
#     # Select only the most relevant physics features to minimize input tokens
#     features = {
#         'event_id': event_data.get('event_id'),
#         'recoil_energy_keV': event_data.get('recoil_energy_keV'),
#         's1_area_PE': event_data.get('s1_area_PE'),
#         's2_area_PE': event_data.get('s2_area_PE'),
#         's2_over_s1_ratio': event_data.get('s2_over_s1_ratio'),
#         'position_z_mm': event_data.get('position_z_mm'),
#         'event_quality': event_data.get('event_quality'),
#     }

#     # System instruction for persona and structured output
#     system_prompt = (
#         "You are a leading particle physicist specializing in dark matter detection at a liquid xenon TPC. "
#         "Your task is to analyze the provided particle event data and provide a classification and detailed reasoning. "
#         "The classification must be based on established physics principles, particularly the S2/S1 ratio. "
#         "S2/S1 < 20 indicates Nuclear Recoil (potential Dark Matter); S2/S1 > 20 indicates Electronic Recoil (Background)."
#     )

#     # User query
#     user_query = (
#         f"Analyze this particle event data and classify it. You MUST output a single JSON object. "
#         f"Event Data: {json.dumps(features)}. "
#         f"Analyze the S2/S1 ratio and Recoil Energy, and consider position (z-mm) to check if it's in the fiducial volume. "
#         f"Classify as one of: 'Background (ER)', 'WIMP-like (NR)', 'Axion-like (ER)', 'Novel Anomaly'."
#     )
    
#     # JSON Schema definition for forced structured output
#     response_schema = {
#         "type": "OBJECT",
#         "properties": {
#             "classification": {"type": "STRING", "description": "The determined event type (e.g., WIMP-like (NR), Background (ER))."},
#             "confidence": {"type": "NUMBER", "description": "Confidence score from 0.0 to 1.0."},
#             "reasoning": {"type": "STRING", "description": "A detailed, multi-sentence scientific explanation justifying the classification based on the event's features and physics rules. Must be comprehensive."},
#             "follow_up_action": {"type": "STRING", "description": "A single, actionable suggestion for a research team (e.g., Re-check veto system; Increase energy threshold)."}
#         },
#         "required": ["classification", "confidence", "reasoning", "follow_up_action"]
#     }
    
#     return system_prompt, user_query, response_schema


# def classify_event_api(event_data: Dict[str, Any], max_retries: int = 3) -> Dict[str, Any]:
#     """
#     Performs the API call to the Gemini model for classification and reasoning.
#     Includes retry logic for rate limits and temporary errors.
#     """
#     system_prompt, user_query, response_schema = create_api_prompt_and_schema(event_data)
    
#     # Construct the API payload - Fixed structure for Gemini API
#     payload = {
#         "contents": [{
#             "parts": [{"text": user_query}]
#         }],
#         "systemInstruction": {
#             "parts": [{"text": system_prompt}]
#         },
#         "generationConfig": {
#             "responseMimeType": "application/json",
#             "responseSchema": response_schema,
#             "temperature": 0.0
#         }
#     }
    
#     url = API_URL_TEMPLATE.format(API_KEY)
    
#     for attempt in range(max_retries):
#         try:
#             headers = {'Content-Type': 'application/json'}
#             response = requests.post(url, headers=headers, data=json.dumps(payload))
#             response.raise_for_status()
            
#             result = response.json()
            
#             # Extract the JSON string from the response
#             if (result.get('candidates') and 
#                 result['candidates'][0].get('content') and 
#                 result['candidates'][0]['content']['parts'][0].get('text')):
                
#                 json_text = result['candidates'][0]['content']['parts'][0]['text']
#                 return json.loads(json_text)
            
#             return {"error": "API response missing content or candidate.", "raw_response": result}

#         except requests.exceptions.HTTPError as e:
#             if response.status_code == 503 and attempt < max_retries - 1:
#                 wait_time = (attempt + 1) * 3  # Exponential backoff: 3, 6, 9 seconds
#                 print(f"  Rate limit hit. Retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})")
#                 time.sleep(wait_time)
#                 continue
#             return {"error": f"API Request Failed: {e}", "response_text": response.text if 'response' in locals() else 'No response'}
#         except requests.exceptions.RequestException as e:
#             return {"error": f"API Request Failed: {e}"}
#         except json.JSONDecodeError as e:
#             return {"error": f"JSON Decode Error: {e}", "raw_text": response.text}
    
#     return {"error": "Max retries exceeded"}


# def select_and_sample_events(df: pd.DataFrame, num_events: int) -> pd.DataFrame:
#     """
#     Selects a balanced sample of dark matter and background events for API testing.
#     """
#     df = df.copy()
    
#     # Calculate S2/S1 locally if missing
#     if 's2_over_s1_ratio' not in df.columns:
#         df['s2_over_s1_ratio'] = df['s2_area_PE'] / df['s1_area_PE'].replace({0: pd.NA})

#     # --- 1. Identify Signal Candidates (Non-Background) ---
#     signal_candidates = df[df['label'] != 'Background'].dropna(subset=['s2_over_s1_ratio'])
    
#     # --- 2. Identify True Background (Electronic Recoil) ---
#     # Filter for clear background events (high S2/S1 is characteristic of background ER)
#     true_background = df[(df['label'] == 'Background') & (df['s2_over_s1_ratio'] > 500)].dropna(subset=['s2_over_s1_ratio'])

#     # --- 3. Create a Balanced Sample for API Testing ---
#     num_signal = min(num_events // 2, len(signal_candidates))
#     num_background = min(num_events - num_signal, len(true_background))
    
#     # Sample without replacement
#     signal_sample = signal_candidates.sample(n=num_signal, random_state=42)
#     background_sample = true_background.sample(n=num_background, random_state=42)
    
#     # Combine and shuffle for a clean test batch
#     test_sample = pd.concat([signal_sample, background_sample]).sample(frac=1, random_state=42)
    
#     print(f"Sampling {len(test_sample)} events for API analysis (Signals: {num_signal}, Backgrounds: {num_background}).")
#     return test_sample


# def run_api_pipeline(df: pd.DataFrame, num_events: int) -> None:
#     """
#     Orchestrates the entire process: filtering, sampling, and API calling.
#     """
#     test_sample = select_and_sample_events(df, num_events=num_events)
    
#     if test_sample.empty:
#         print('No events selected for API analysis. Exiting.')
#         return

#     out: List[Dict[str, Any]] = []
    
#     for _, row in test_sample.iterrows():
#         evt = row.to_dict()
        
#         # Ensure 'event_id' is present and not the pandas index
#         if 'event_id' not in evt:
#              evt['event_id'] = evt.get('index', 'UNKNOWN_ID')

#         print(f"--- Analyzing Event {evt['event_id']} (True Label: {evt['label']}) ---")
        
#         # This is where the token usage occurs
#         api_analysis = classify_event_api(evt)
        
#         # Append the analysis to the event data
#         evt['api_analysis'] = api_analysis
#         out.append(evt)
        
#         # Print the key results directly
#         if isinstance(api_analysis, dict) and 'classification' in api_analysis:
#             print(f"Classification: {api_analysis['classification']} (Conf: {api_analysis['confidence']:.2f})")
#             print(f"Reasoning Snippet: {api_analysis['reasoning'][:100]}...")
#         else:
#             print(f"API Error or Malformed Response: {api_analysis}")
            
#         # Wait to respect rate limits and manage costs
#         time.sleep(2) 

#     # Save the final results
#     output_filename = 'claude_classified_results_detailed.json'
#     with open(output_filename, 'w', encoding='utf-8') as f:
#         json.dump(out, f, indent=2, ensure_ascii=False)
#     print(f'\nPipeline complete. Detailed results saved to {output_filename}')


# def main() -> None:
#     args = parse_args()
#     try:
#         df = pd.read_csv(CSV)
#     except FileNotFoundError:
#         print(f'Error: {CSV} not found. Ensure the dataset is in the current directory.')
#         sys.exit(1)

#     # Ensure event_id is a column for consistent tracking
#     if 'event_id' not in df.columns:
#         df = df.reset_index().rename(columns={'index': 'event_id'})

#     run_api_pipeline(df, num_events=args.num_events)


# if __name__ == '__main__':
#     main()


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
from typing import Any, Dict, List

import pandas as pd
# Use the Python 'requests' library for the HTTP API call
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- API Configuration ---
# API key is now loaded from .env file for security
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in .env file.")

API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={}"
MODEL_NAME = "gemini-1.5-flash" # Stable model

CSV = 'dataset/dark_matter_synthetic_dataset.csv'

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description='Classify candidate events using Gemini/Claude API')
    p.add_argument('--num-events', type=int, default=10, help='Number of events to classify using the API')
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

    # User query - ENHANCED WITH DETAILED INSTRUCTIONS
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
        
        f"Provide comprehensive, multi-paragraph scientific reasoning with specific numerical references."
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
    Performs the API call to the Gemini model for classification and reasoning.
    """
    system_prompt, user_query, response_schema = create_api_prompt_and_schema(event_data)
    
    # Construct the API payload - Fixed structure for Gemini API
    payload = {
        "contents": [{"parts": [{"text": user_query}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": response_schema,
            "temperature": 0.0
        }
    }
    
    url = API_URL_TEMPLATE.format(API_KEY)
    
    # Use exponential backoff for retries (not fully implemented here for brevity,
    # but essential for production/heavy use)
    try:
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        
        result = response.json()
        
        # Extract the JSON string from the response
        if (result.get('candidates') and 
            result['candidates'][0].get('content') and 
            result['candidates'][0]['content']['parts'][0].get('text')):
            
            json_text = result['candidates'][0]['content']['parts'][0]['text']
            # Attempt to parse the structured JSON output
            return json.loads(json_text)
        
        # Handle cases where the model returns an error or empty content
        return {"error": "API response missing content or candidate.", "raw_response": result}

    except requests.exceptions.RequestException as e:
        return {"error": f"API Request Failed: {e}"}
    except json.JSONDecodeError as e:
        # If decoding the main response fails, return what we have
        return {"error": f"JSON Decode Error in primary response: {e}", "raw_text": response.text}


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

    run_api_pipeline(df, num_events=args.num_events)


if __name__ == '__main__':
    main()
