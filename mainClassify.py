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

# # --- API Configuration (PLACEHOLDERS - Replace these values) ---
# # NOTE: Use an environment variable or secret management for the real API key.
# # For testing purposes, we define a placeholder and API URL structure here.
# API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyDrp9uzRara99-VFDqXhKJ59qX4gEVy71c") # Placeholder for the key
# API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={}"
# MODEL_NAME = "gemini-2.5-flash" # Cost-effective model for detailed reasoning

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

API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={}"
MODEL_NAME = "gemini-2.5-flash" # Cost-effective model for detailed reasoning

CSV = 'dark_matter_synthetic_dataset.csv'

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description='Classify candidate events using Gemini/Claude API')
    p.add_argument('--num-events', type=int, default=10, help='Number of events to classify using the API')
    return p.parse_args()


def create_api_prompt_and_schema(event_data: Dict[str, Any]) -> tuple:
    """
    Creates a detailed, structured prompt and JSON schema to guide the LLM's reasoning
    based on the updated S2/S1 classification bands.
    """
    
    # Select only the most relevant physics features to minimize input tokens
    features = {
        'event_id': event_data.get('event_id'),
        'recoil_energy_keV': event_data.get('recoil_energy_keV'),
        's1_area_PE': event_data.get('s1_area_PE'),
        's2_area_PE': event_data.get('s2_area_PE'),
        's2_over_s1_ratio': event_data.get('s2_over_s1_ratio'),
        'position_z_mm': event_data.get('position_z_mm'),
        'event_quality': event_data.get('event_quality'),
    }

    # System instruction for persona and structured output - UPDATED WITH NEW RULES
    system_prompt = (
        "You are a leading particle physicist specializing in dark matter detection at a liquid xenon TPC. "
        "Your task is to analyze the provided particle event data and provide a classification and detailed reasoning. "
        "The classification must strictly adhere to the following S2/S1 ratio bands: "
        "1. High S2/S1 (>5): Classify as Background (Electronic Recoil - ER). "
        "2. Medium S2/S1 (2.0 to 4.0): Classify as WIMP-like (Nuclear Recoil - NR). "
        "3. Low S2/S1 (<2.0): Classify as Axion-like (Exotic Electron Recoil - ER). "
        "Events falling exactly on the boundary or between specified bands (e.g., 4.0 to 5.0) should be classified as the most probable neighboring type with reduced confidence."
    )

    # User query
    user_query = (
        f"Analyze this particle event data and classify it according to the three S2/S1 bands (High, Medium, Low). You MUST output a single JSON object. "
        f"Event Data: {json.dumps(features)}. "
        f"Analyze the S2/S1 ratio, Recoil Energy, and Position (z-mm). "
        f"Classify as one of: 'Background (ER)', 'WIMP-like (NR)', 'Axion-like (ER)', 'Novel Anomaly'."
    )
    
    # JSON Schema definition for forced structured output
    response_schema = {
        "type": "OBJECT",
        "properties": {
            "classification": {"type": "STRING", "description": "The determined event type (e.g., WIMP-like (NR), Background (ER))."},
            "confidence": {"type": "NUMBER", "description": "Confidence score from 0.0 to 1.0."},
            "reasoning": {"type": "STRING", "description": "A detailed, multi-sentence scientific explanation justifying the classification based on the event's features and physics rules. Must be comprehensive."},
            "follow_up_action": {"type": "STRING", "description": "A single, actionable suggestion for a research team (e.g., Re-check veto system; Increase energy threshold)."}
        },
        "required": ["classification", "confidence", "reasoning", "follow_up_action"]
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
        
        # Print the key results directly
        if isinstance(api_analysis, dict) and 'classification' in api_analysis:
            # FIX: Print the full reasoning without truncation
            print(f"Classification: {api_analysis['classification']} (Conf: {api_analysis['confidence']:.2f})")
            print(f"Reasoning: {api_analysis['reasoning']}") # Print the full reasoning here
            print(f"Follow-up: {api_analysis['follow_up_action']}")
        else:
            print(f"API Error or Malformed Response: {api_analysis}")
            
        # Wait to respect rate limits and manage costs
        time.sleep(2) 

    # Save the final results
    output_filename = 'claude_classified_results_detailed.json'
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
