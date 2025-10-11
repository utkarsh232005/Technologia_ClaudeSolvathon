#!/usr/bin/env python3
"""
Test script for anomaly detection API endpoints
"""

import requests
import json

def test_anomaly_detect():
    """Test the /api/anomaly/detect endpoint"""
    print("🧪 Testing /api/anomaly/detect endpoint...")
    print()
    
    # Sample event data
    test_events = [
        {
            'energy': 45.2,
            's1': 89,
            's2': 11152,
            's2s1Ratio': 125.3,
            'position': {'x': 50, 'y': 100, 'z': 200}
        },
        {
            'energy': 12.5,
            's1': 45,
            's2': 320,
            's2s1Ratio': 7.11,
            'position': {'x': -25, 'y': -205, 'z': 343}
        }
    ]
    
    try:
        response = requests.post(
            'http://localhost:5001/api/anomaly/detect',
            json={
                'events': test_events,
                'use_claude': False,  # Disable Claude for faster testing
                'threshold': 0.3
            },
            timeout=30
        )
        
        data = response.json()
        
        if response.status_code == 200 and data.get('success'):
            print("✅ Anomaly detection successful!")
            print(f"   📊 Total events analyzed: {data['total_events_analyzed']}")
            print(f"   🚨 Anomalies detected: {data['anomalies_detected']}")
            print(f"   📈 Anomaly rate: {data['anomaly_rate']:.2%}")
            
            if data['results']:
                print(f"\n   🔍 Sample anomaly:")
                anomaly = data['results'][0]
                print(f"      - Event Index: {anomaly['event_index']}")
                print(f"      - Anomaly Score: {anomaly['anomaly_score']:.3f}")
                print(f"      - Classification: {anomaly['classification']}")
                print(f"      - Confidence: {anomaly['confidence']:.2%}")
            
            return True
        else:
            print(f"❌ Request failed:")
            print(f"   Status: {response.status_code}")
            print(f"   Error: {data.get('error', 'Unknown error')}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server")
        print("   Make sure to run: python3 webapp_backend.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_analyze_dataset():
    """Test the /api/anomaly/analyze-dataset endpoint"""
    print("\n" + "="*60)
    print("🧪 Testing /api/anomaly/analyze-dataset endpoint...")
    print()
    
    try:
        response = requests.post(
            'http://localhost:5001/api/anomaly/analyze-dataset',
            json={
                'max_events': 50,
                'use_claude': False,  # Disable Claude for faster testing
                'threshold': 0.3
            },
            timeout=60
        )
        
        data = response.json()
        
        if response.status_code == 200 and data.get('success'):
            stats = data['statistics']
            print("✅ Dataset analysis successful!")
            print(f"   📊 Total analyzed: {stats['total_analyzed']}")
            print(f"   🚨 Anomalies detected: {stats['anomalies_detected']}")
            print(f"   📈 Anomaly rate: {stats['anomaly_rate']:.2%}")
            print(f"   📊 Avg anomaly score: {stats['avg_anomaly_score']:.3f}")
            
            if stats['by_type']:
                print(f"\n   🎯 Anomalies by type:")
                for atype, count in stats['by_type'].items():
                    print(f"      - {atype}: {count}")
            
            print(f"\n   📋 Top anomalies: {len(data['top_anomalies'])}")
            
            return True
        else:
            print(f"❌ Request failed:")
            print(f"   Status: {response.status_code}")
            print(f"   Error: {data.get('error', 'Unknown error')}")
            if 'details' in data:
                print(f"\n   Details: {data['details'][:200]}...")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server")
        print("   Make sure to run: python3 webapp_backend.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_anomaly_system_available():
    """Check if anomaly detection system is available"""
    print("🔍 Checking anomaly detection system availability...")
    print()
    
    try:
        # Try importing the anomaly detection system
        import sys
        import os
        
        anomaly_sys_path = os.path.join(os.path.dirname(__file__), 'anomaly_detection_system')
        sys.path.insert(0, anomaly_sys_path)
        
        from mainAnomalyDetection import detect_anomalies_advanced
        print("✅ Anomaly detection system is available")
        print(f"   Path: {anomaly_sys_path}")
        return True
    except ImportError as e:
        print(f"❌ Anomaly detection system not available")
        print(f"   Error: {e}")
        print(f"   Make sure 'anomaly_detection_system' folder exists")
        return False

if __name__ == '__main__':
    print("="*60)
    print("  ANOMALY DETECTION API TEST SUITE")
    print("="*60)
    print()
    
    # Check system availability
    system_available = check_anomaly_system_available()
    print()
    
    if not system_available:
        print("⚠️  Warning: Anomaly detection system not found")
        print("   Backend will return 503 errors")
        print()
    
    # Test endpoints
    result1 = test_anomaly_detect()
    result2 = test_analyze_dataset()
    
    print("\n" + "="*60)
    if result1 and result2:
        print("✅ ALL TESTS PASSED!")
    else:
        print("❌ SOME TESTS FAILED")
    print("="*60)
    
    exit(0 if (result1 and result2) else 1)
