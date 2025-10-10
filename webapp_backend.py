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

# Import our classification modules
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# We'll import the classification functions from mainClassify.py
from mainClassify import (
    classify_event_api,
    select_and_sample_events,
    create_api_prompt_and_schema
)

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
            'eventTypes': df['label'].value_counts().to_dict() if 'label' in df.columns else {},
            'energyRange': {
                'min': float(df['recoil_energy_keV'].min()) if 'recoil_energy_keV' in df.columns else 0,
                'max': float(df['recoil_energy_keV'].max()) if 'recoil_energy_keV' in df.columns else 0
            },
            'preview': df.head(10).to_dict('records')
        }
        
        return jsonify({
            'success': True,
            'dataset': dataset_info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to load dataset: {str(e)}'
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
    print("\n⚡ Server starting on port 5001...")
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        threaded=True
    )
