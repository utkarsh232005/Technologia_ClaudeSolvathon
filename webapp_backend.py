#!/usr/bin/env python3
"""
webapp_backend.py - Flask backend server for Dark Matter Classification webapp

This server provides REST API endpoints that integrate the mainClassify.py 
classification logic with the React frontend webapp.
"""

import os
import json
import tempfile
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import our classification modules
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# We'll import the classification functions from mainClassify.py
from mainClassify import (
    classify_event_api,
    select_and_sample_events,
    create_api_prompt_and_schema
)

# Import anomaly detection system
anomaly_sys_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'anomaly_detection_system')
sys.path.insert(0, anomaly_sys_path)

# Import with proper error handling
try:
    from mainAnomalyDetection import (
        classify_event_with_claude,
        detect_anomalies_advanced
    )
    ANOMALY_DETECTION_AVAILABLE = True
    print("✅ Anomaly detection system imported successfully")
except ImportError as e:
    print(f"⚠️  Warning: Could not import anomaly detection system: {e}")
    ANOMALY_DETECTION_AVAILABLE = False
    # Create dummy functions
    def classify_event_with_claude(event_data):
        return {"classification": "Unknown", "confidence": 0.0, "reasoning": "Anomaly detection not available"}
    def detect_anomalies_advanced(df, use_claude=True, max_events=None, threshold=0.3):
        return pd.DataFrame()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
UPLOAD_FOLDER = 'temp_uploads'
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'csv', 'json'}

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_single_event_to_dataset_format(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert webapp event format to mainClassify.py expected format
    """
    return {
        'event_id': f"WEB-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        'recoil_energy_keV': float(event_data.get('recoilEnergy', 0)),
        's1_area_PE': float(event_data.get('s1Signal', 0)),
        's2_area_PE': float(event_data.get('s2Signal', 0)),
        's2_over_s1_ratio': float(event_data.get('s2Signal', 0)) / max(float(event_data.get('s1Signal', 1)), 1e-6),
        'position_x_mm': float(event_data.get('positionX', 0)) * 10,  # Convert cm to mm
        'position_y_mm': float(event_data.get('positionY', 0)) * 10,  # Convert cm to mm
        'position_z_mm': float(event_data.get('positionZ', 0)) * 10,  # Convert cm to mm
        'timestamp': event_data.get('timestamp', datetime.now().isoformat()),
        'event_quality': 0.8,  # Default quality
        'pile_up_flag': 0,
        'drift_time_us': float(event_data.get('positionZ', 0)) * 10 / 1.33,  # Calculate drift time
        's1_width_ns': 50.0,  # Default values
        's2_width_us': 2.5,
        'interaction_type': 'unknown',
        'particle_source': 'unknown',
        'label': 'Unknown'
    }

def format_classification_result(api_result: Dict[str, Any], processing_time: float) -> Dict[str, Any]:
    """
    Format the API classification result for webapp consumption
    """
    if 'error' in api_result:
        return {
            'success': False,
            'error': api_result['error'],
            'processingTime': processing_time
        }
    
    # Extract main classification
    classification = api_result.get('classification', 'Unknown')
    confidence = api_result.get('confidence', 0.0)
    
    # Determine webapp classification format
    if 'WIMP' in classification:
        webapp_type = 'WIMP'
        severity = 'high' if confidence > 0.8 else 'medium'
    elif 'Background' in classification:
        webapp_type = 'Background'
        severity = 'low'
    elif 'Axion' in classification:
        webapp_type = 'Axion'
        severity = 'medium'
    elif 'Novel' in classification or 'Anomaly' in classification:
        webapp_type = 'Anomaly'
        severity = 'critical'
    else:
        webapp_type = 'Unknown'
        severity = 'low'
    
    # Extract key features for webapp display
    key_features = []
    
    s2s1_analysis = api_result.get('s2_s1_analysis', '')
    if s2s1_analysis:
        if 'low' in s2s1_analysis.lower():
            key_features.append('Low S2/S1 ratio')
        elif 'high' in s2s1_analysis.lower():
            key_features.append('High S2/S1 ratio')
    
    energy_analysis = api_result.get('energy_analysis', '')
    if 'WIMP search window' in energy_analysis:
        key_features.append('WIMP energy range')
    
    position_analysis = api_result.get('position_analysis', '')
    if 'fiducial' in position_analysis.lower():
        key_features.append('Fiducial volume position')
        
    if not key_features:
        key_features = ['Standard detector response']
    
    return {
        'success': True,
        'classification': {
            'type': webapp_type,
            'label': classification,
            'confidence': round(confidence * 100, 1),  # Convert to percentage
            'severity': severity,
            'processingTime': round(processing_time, 2)
        },
        'analysis': {
            'keyFeatures': key_features,
            'reasoning': {
                's2s1Analysis': api_result.get('s2_s1_analysis', ''),
                'energyAnalysis': api_result.get('energy_analysis', ''),
                'positionAnalysis': api_result.get('position_analysis', ''),
                'pulseCharacteristics': api_result.get('pulse_characteristics', ''),
                'physicsInterpretation': api_result.get('physics_interpretation', ''),
                'comparisonWithLiterature': api_result.get('comparison_with_literature', ''),
                'alternativeInterpretations': api_result.get('alternative_interpretations', ''),
                'confidenceFactors': api_result.get('confidence_factors', ''),
                'followUpRecommendations': api_result.get('follow_up_recommendations', '')
            }
        },
        'processingTime': round(processing_time, 2)
    }

def clean_nan_values(obj):
    """
    Recursively clean NaN, Infinity, and other non-JSON-serializable values from objects
    """
    if isinstance(obj, dict):
        return {k: clean_nan_values(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan_values(item) for item in obj]
    elif isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return obj
    elif pd.isna(obj):
        return None
    return obj

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Dark Matter Classification API',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/classify/single', methods=['POST'])
def classify_single_event():
    """
    Classify a single event from the webapp form
    """
    try:
        start_time = datetime.now()
        
        # Get event data from request
        event_data = request.json
        if not event_data:
            return jsonify({'error': 'No event data provided'}), 400
        
        # Validate required fields
        required_fields = ['recoilEnergy', 's1Signal', 's2Signal']
        missing_fields = [field for field in required_fields if not event_data.get(field)]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400
        
        # Convert to dataset format
        dataset_event = convert_single_event_to_dataset_format(event_data)
        
        # Classify using mainClassify.py
        api_result = classify_event_api(dataset_event)
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds() * 1000  # in milliseconds
        
        # Format result for webapp
        result = format_classification_result(api_result, processing_time)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Classification failed: {str(e)}'
        }), 500

@app.route('/api/classify/batch', methods=['POST'])
def classify_batch_events():
    """
    Handle batch classification from uploaded files
    """
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only CSV and JSON files are allowed'}), 400
        
        # Save uploaded file temporarily
        filename = f"batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        try:
            # Load and validate data
            if file.filename.endswith('.csv'):
                df = pd.read_csv(filepath)
            elif file.filename.endswith('.json'):
                with open(filepath, 'r') as f:
                    data = json.load(f)
                df = pd.DataFrame(data)
            
            # Validate required columns
            required_cols = ['energy', 's1', 's2']
            missing_cols = [col for col in required_cols if col not in df.columns]
            if missing_cols:
                return jsonify({
                    'error': f'Missing required columns: {missing_cols}',
                    'availableColumns': list(df.columns)
                }), 400
            
            # Convert column names to match our format
            column_mapping = {
                'energy': 'recoil_energy_keV',
                's1': 's1_area_PE',
                's2': 's2_area_PE',
                'id': 'event_id'
            }
            
            for old_col, new_col in column_mapping.items():
                if old_col in df.columns:
                    df[new_col] = df[old_col]
            
            # Calculate S2/S1 ratio
            df['s2_over_s1_ratio'] = df['s2_area_PE'] / df['s1_area_PE'].replace({0: np.nan})
            
            # Add default values for missing columns
            default_values = {
                'event_id': [f"BATCH-{i:04d}" for i in range(len(df))],
                'position_x_mm': 0.0,
                'position_y_mm': 0.0,
                'position_z_mm': 100.0,
                'drift_time_us': 75.0,
                's1_width_ns': 50.0,
                's2_width_us': 2.5,
                'event_quality': 0.8,
                'pile_up_flag': 0,
                'interaction_type': 'unknown',
                'particle_source': 'unknown',
                'label': 'Unknown'
            }
            
            for col, default_val in default_values.items():
                if col not in df.columns:
                    if isinstance(default_val, list):
                        df[col] = default_val
                    else:
                        df[col] = default_val
            
            # Return basic file info for preview
            preview_data = df.head(5).to_dict('records')
            
            return jsonify({
                'success': True,
                'message': 'File uploaded and validated successfully',
                'fileInfo': {
                    'filename': file.filename,
                    'size': os.path.getsize(filepath),
                    'totalEvents': len(df),
                    'columns': list(df.columns)
                },
                'preview': preview_data,
                'tempFilePath': filepath  # We'll use this for actual processing
            })
            
        except Exception as e:
            return jsonify({'error': f'Failed to process file: {str(e)}'}), 400
        
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/api/classify/batch/process', methods=['POST'])
def process_batch_classification():
    """
    Process batch classification for uploaded file
    """
    try:
        request_data = request.json
        temp_file_path = request_data.get('tempFilePath')
        
        if not temp_file_path or not os.path.exists(temp_file_path):
            return jsonify({'error': 'File not found or expired'}), 400
        
        # Load the file
        if temp_file_path.endswith('.csv'):
            df = pd.read_csv(temp_file_path)
        else:
            with open(temp_file_path, 'r') as f:
                data = json.load(f)
            df = pd.DataFrame(data)
        
        # Reconstruct the dataframe with proper columns (same logic as upload)
        column_mapping = {
            'energy': 'recoil_energy_keV',
            's1': 's1_area_PE',
            's2': 's2_area_PE',
            'id': 'event_id'
        }
        
        for old_col, new_col in column_mapping.items():
            if old_col in df.columns:
                df[new_col] = df[old_col]
        
        df['s2_over_s1_ratio'] = df['s2_area_PE'] / df['s1_area_PE'].replace({0: np.nan})
        
        # Add missing columns with defaults
        default_values = {
            'event_id': [f"BATCH-{i:04d}" for i in range(len(df))],
            'position_x_mm': 0.0,
            'position_y_mm': 0.0,
            'position_z_mm': 100.0,
            'drift_time_us': 75.0,
            's1_width_ns': 50.0,
            's2_width_us': 2.5,
            'event_quality': 0.8,
            'pile_up_flag': 0,
            'interaction_type': 'unknown',
            'particle_source': 'unknown',
            'label': 'Unknown'
        }
        
        for col, default_val in default_values.items():
            if col not in df.columns:
                if isinstance(default_val, list):
                    df[col] = default_val
                else:
                    df[col] = default_val
        
        # Process each event (limit to reasonable batch size)
        max_batch_size = 50  # Limit for demo purposes
        if len(df) > max_batch_size:
            df = df.head(max_batch_size)
        
        results = []
        
        for idx, row in df.iterrows():
            try:
                start_time = datetime.now()
                
                # Convert row to dict
                event_dict = row.to_dict()
                
                # Classify the event
                api_result = classify_event_api(event_dict)
                
                processing_time = (datetime.now() - start_time).total_seconds() * 1000
                
                # Format result
                formatted_result = format_classification_result(api_result, processing_time)
                
                # Create result entry for webapp
                result_entry = {
                    'id': event_dict.get('event_id', f'EVT-{idx}'),
                    'energy': event_dict.get('recoil_energy_keV', 0),
                    's1': event_dict.get('s1_area_PE', 0),
                    's2': event_dict.get('s2_area_PE', 0),
                    's2s1Ratio': event_dict.get('s2_over_s1_ratio', 0),
                    'type': formatted_result['classification']['type'] if formatted_result['success'] else 'Error',
                    'confidence': formatted_result['classification']['confidence'] if formatted_result['success'] else 0,
                    'processingTime': processing_time,
                    'classification': formatted_result,
                    'timestamp': datetime.now().isoformat()
                }
                
                results.append(result_entry)
                
            except Exception as e:
                # Handle individual event errors
                results.append({
                    'id': f'EVT-{idx}',
                    'energy': row.get('recoil_energy_keV', 0),
                    's1': row.get('s1_area_PE', 0),
                    's2': row.get('s2_area_PE', 0),
                    's2s1Ratio': 0,
                    'type': 'Error',
                    'confidence': 0,
                    'processingTime': 0,
                    'error': str(e),
                    'timestamp': datetime.now().isoformat()
                })
        
        # Cleanup temp file
        try:
            os.remove(temp_file_path)
        except:
            pass  # Ignore cleanup errors
        
        return jsonify({
            'success': True,
            'results': results,
            'summary': {
                'totalProcessed': len(results),
                'successful': len([r for r in results if r.get('type') != 'Error']),
                'errors': len([r for r in results if r.get('type') == 'Error']),
                'averageProcessingTime': sum(r['processingTime'] for r in results) / len(results) if results else 0
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Batch processing failed: {str(e)}'
        }), 500

@app.route('/api/dataset/load', methods=['GET'])
def load_dataset():
    """
    Load the synthetic dataset for webapp display
    """
    try:
        # Load from the dataset folder
        csv_path = os.path.join('dataset', 'dark_matter_synthetic_dataset.csv')
        
        if not os.path.exists(csv_path):
            return jsonify({'error': 'Dataset not found. Please generate dataset first.'}), 404
        
        df = pd.read_csv(csv_path)
        
        # Convert to webapp format
        dataset_info = {
            'totalEvents': len(df),
            'columns': list(df.columns),
            'classificationLabels': df['label'].unique().tolist() if 'label' in df.columns else [],
            'eventTypes': df['label'].value_counts().to_dict() if 'label' in df.columns else {},
            'energyRange': {
                'min': float(df['recoil_energy_keV'].min()) if 'recoil_energy_keV' in df.columns else 0,
                'max': float(df['recoil_energy_keV'].max()) if 'recoil_energy_keV' in df.columns else 0
            },
            'preview': clean_nan_values(df.head(10).to_dict('records'))
        }
        
        # Clean NaN values before returning
        dataset_info = clean_nan_values(dataset_info)
        
        return jsonify({
            'success': True,
            'dataset': dataset_info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to load dataset: {str(e)}'
        }), 500

@app.route('/api/anomaly/detect', methods=['POST'])
def detect_anomalies():
    """
    Detect anomalies in event data using the anomaly detection system
    Accepts single event or batch of events
    """
    try:
        # Check if anomaly detection is available
        if not ANOMALY_DETECTION_AVAILABLE:
            return jsonify({
                'success': False,
                'error': 'Anomaly detection system not available. Please ensure mainAnomalyDetection.py is accessible.'
            }), 503
        
        data = request.json
        
        # Get event data (can be single event or array)
        events = data.get('events', [])
        if not events:
            # Check if single event data provided
            if 'energy' in data or 'recoil_energy_keV' in data:
                events = [data]
            else:
                return jsonify({
                    'success': False,
                    'error': 'No event data provided'
                }), 400
        
        # Configuration options
        use_claude = data.get('use_claude', True)
        threshold = data.get('threshold', 0.3)
        
        print(f"Processing {len(events)} events for anomaly detection...")
        
        # Convert events to DataFrame format expected by anomaly detection system
        df_data = []
        for event in events:
            # Map frontend field names to dataset column names
            event_row = {
                'recoil_energy_keV': float(event.get('energy', event.get('recoil_energy_keV', 0))),
                's2_over_s1_ratio': float(event.get('s2s1Ratio', event.get('s2_over_s1_ratio', 
                    event.get('s2', 0) / event.get('s1', 1) if event.get('s1', 1) != 0 else 0))),
                's1_area_PE': float(event.get('s1', event.get('s1_area_PE', 0))),
                's2_area_PE': float(event.get('s2', event.get('s2_area_PE', 0))),
                'position_x_mm': float(event.get('position', {}).get('x', event.get('position_x_mm', 0)) if isinstance(event.get('position'), dict) else event.get('position_x_mm', 0)),
                'position_y_mm': float(event.get('position', {}).get('y', event.get('position_y_mm', 0)) if isinstance(event.get('position'), dict) else event.get('position_y_mm', 0)),
                'position_z_mm': float(event.get('position', {}).get('z', event.get('position_z_mm', 0)) if isinstance(event.get('position'), dict) else event.get('position_z_mm', 0)),
                'drift_time_us': float(event.get('drift_time_us', 400)),
                's1_width_ns': float(event.get('s1_width_ns', 50))
            }
            df_data.append(event_row)
        
        # Create DataFrame
        df = pd.DataFrame(df_data)
        print(f"Created DataFrame with {len(df)} rows")
        print(f"Columns: {df.columns.tolist()}")
        
        # Run anomaly detection
        anomaly_results = detect_anomalies_advanced(
            df, 
            use_claude=use_claude,
            max_events=len(df),
            threshold=threshold
        )
        
        print(f"Anomaly detection complete. Found {len(anomaly_results)} anomalies")
        
        # Format results for frontend
        results = []
        for idx, anomaly in anomaly_results.iterrows():
            result = {
                'event_index': int(idx),
                'is_anomaly': True,
                'anomaly_score': float(anomaly.get('anomaly_score', 0)),
                'anomaly_flags': anomaly.get('anomaly_flags', []) if isinstance(anomaly.get('anomaly_flags'), list) else [],
                'classification': str(anomaly.get('classification', 'Unknown')),
                'confidence': float(anomaly.get('confidence', 0)),
                'reasoning': str(anomaly.get('reasoning', '')),
                'event_data': {
                    'energy': float(anomaly.get('recoil_energy_keV', 0)),
                    's2s1Ratio': float(anomaly.get('s2_over_s1_ratio', 0)),
                    's1': float(anomaly.get('s1_area_PE', 0)),
                    's2': float(anomaly.get('s2_area_PE', 0))
                }
            }
            results.append(result)
        
        return jsonify({
            'success': True,
            'anomalies_detected': len(results),
            'total_events_analyzed': len(events),
            'anomaly_rate': len(results) / len(events) if len(events) > 0 else 0,
            'results': results
        })
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in anomaly detection: {str(e)}")
        print(error_trace)
        return jsonify({
            'success': False,
            'error': f'Anomaly detection failed: {str(e)}',
            'details': error_trace if app.debug else None
        }), 500

@app.route('/api/anomaly/analyze-dataset', methods=['POST'])
def analyze_dataset_for_anomalies():
    """
    Analyze the entire dataset for anomalies
    """
    try:
        # Check if anomaly detection is available
        if not ANOMALY_DETECTION_AVAILABLE:
            return jsonify({
                'success': False,
                'error': 'Anomaly detection system not available. Please ensure mainAnomalyDetection.py is accessible.'
            }), 503
        
        # Load the dataset
        dataset_path = os.path.join(os.path.dirname(__file__), 'dataset', 'dark_matter_synthetic_dataset.csv')
        
        print(f"Looking for dataset at: {dataset_path}")
        
        if not os.path.exists(dataset_path):
            return jsonify({
                'success': False,
                'error': f'Dataset file not found at: {dataset_path}'
            }), 404
        
        print("Loading dataset...")
        df = pd.read_csv(dataset_path)
        print(f"Loaded {len(df)} events from dataset")
        
        # Get parameters
        data = request.json or {}
        max_events = data.get('max_events', 100)  # Limit for performance
        use_claude = data.get('use_claude', True)
        threshold = data.get('threshold', 0.3)
        
        print(f"Analysis parameters: max_events={max_events}, use_claude={use_claude}, threshold={threshold}")
        
        # Analyze subset of dataset
        df_subset = df.head(max_events)
        print(f"Analyzing {len(df_subset)} events...")
        
        # Run anomaly detection
        anomaly_results = detect_anomalies_advanced(
            df_subset,
            use_claude=use_claude,
            max_events=max_events,
            threshold=threshold
        )
        
        print(f"Analysis complete. Found {len(anomaly_results)} anomalies")
        
        # Statistics
        stats = {
            'total_analyzed': len(df_subset),
            'anomalies_detected': len(anomaly_results),
            'anomaly_rate': len(anomaly_results) / len(df_subset) if len(df_subset) > 0 else 0,
            'by_type': {},
            'avg_anomaly_score': float(anomaly_results['anomaly_score'].mean()) if len(anomaly_results) > 0 and 'anomaly_score' in anomaly_results.columns else 0
        }
        
        # Count by anomaly type
        if len(anomaly_results) > 0 and 'classification' in anomaly_results.columns:
            type_counts = anomaly_results['classification'].value_counts().to_dict()
            stats['by_type'] = {str(k): int(v) for k, v in type_counts.items()}
        
        # Format top anomalies for frontend with full details
        top_anomalies = []
        for idx, row in anomaly_results.head(20).iterrows():
            # Parse anomaly flags if they're stored as JSON string
            anomaly_flags = row.get('Flags_Detail', row.get('anomaly_flags', []))
            if isinstance(anomaly_flags, str):
                try:
                    anomaly_flags = json.loads(anomaly_flags)
                except:
                    anomaly_flags = []
            elif not isinstance(anomaly_flags, list):
                anomaly_flags = []
            
            # Determine severity
            anomaly_score = float(row.get('Anomaly_Score', row.get('anomaly_score', 0)))
            severity = 'Critical' if anomaly_score > 0.7 else 'High' if anomaly_score > 0.5 else 'Medium'
            
            # Helper function to safely convert values, handling NaN
            def safe_float(val, default=0.0):
                try:
                    f = float(val)
                    return None if (np.isnan(f) or np.isinf(f)) else f
                except (ValueError, TypeError):
                    return default
            
            anomaly_entry = {
                'event_index': row.get('Event_ID', int(idx)),
                'anomaly_score': safe_float(anomaly_score, 0.0),
                'severity': severity,
                'classification': str(row.get('AI_Classification', row.get('classification', 'Unknown'))),
                'confidence': safe_float(row.get('AI_Confidence', row.get('confidence', 0))),
                'energy': safe_float(row.get('Energy_keV', row.get('recoil_energy_keV', 0))),
                's2s1_ratio': safe_float(row.get('S2_S1_Ratio', row.get('s2_over_s1_ratio', 0))),
                'position_x': safe_float(row.get('Position_X', row.get('position_x_mm', 0))),
                'position_y': safe_float(row.get('Position_Y', row.get('position_y_mm', 0))),
                'drift_time': safe_float(row.get('Drift_Time_us', row.get('drift_time_us', 0))),
                'anomaly_flags': anomaly_flags,
                'reasoning': str(row.get('AI_Reasoning', '')) if 'AI_Reasoning' in row else '',
                'num_flags': row.get('Num_Flags', len(anomaly_flags))
            }
            
            # Clean the entry
            anomaly_entry = clean_nan_values(anomaly_entry)
            top_anomalies.append(anomaly_entry)
        
        print(f"Returning {len(top_anomalies)} top anomalies with full details")
        
        # Clean all NaN values before returning
        response_data = clean_nan_values({
            'success': True,
            'statistics': stats,
            'top_anomalies': top_anomalies
        })
        
        return jsonify(response_data)
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error analyzing dataset: {str(e)}")
        print(error_trace)
        return jsonify({
            'success': False,
            'error': f'Dataset analysis failed: {str(e)}',
            'details': error_trace if app.debug else None
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Dark Matter Classification Backend Server...")
    print("📊 Webapp will connect to: http://localhost:5001")
    print("🔬 API endpoints available:")
    print("   GET  /api/health")
    print("   POST /api/classify/single")
    print("   POST /api/classify/batch")
    print("   POST /api/classify/batch/process")
    print("   GET  /api/dataset/load")
    print("   POST /api/anomaly/detect")
    print("   POST /api/anomaly/classify")
    print("   POST /api/anomaly/analyze-dataset")
    print("\n⚡ Server starting on port 5001...")
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        threaded=True
    )
