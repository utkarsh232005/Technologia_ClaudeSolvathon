#!/usr/bin/env python3
"""
Test script for anomaly detection API endpoints (without Claude AI)
Tests the statistical anomaly detection without requiring API keys
"""

import requests
import json
import sys

API_BASE_URL = "http://localhost:5001"

def print_header(text):
    print(f"\n{'=' * 80}")
    print(f"  {text}")
    print('=' * 80 + "\n")

def test_single_event_detection():
    """Test single event anomaly detection without Claude"""
    print_header("TEST 1: Single Event Anomaly Detection (No Claude)")
    
    url = f"{API_BASE_URL}/api/anomaly/detect"
    
    # Test event with unusual values (likely anomaly)
    event_data = {
        "events": [{
            "energy": 150.5,
            "s1": 250,
            "s2": 8000,
            "s2s1Ratio": 32.0
        }],
        "use_claude": False,  # Disable Claude for this test
        "threshold": 0.3
    }
    
    try:
        print(f"POST {url}")
        print(f"Request data: {json.dumps(event_data, indent=2)}")
        
        response = requests.post(url, json=event_data, timeout=30)
        
        print(f"\nStatus Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if result.get('success'):
            print("\n✅ Single event detection working!")
            anomalies = result.get('anomalies_detected', 0)
            total = result.get('total_events_analyzed', 0)
            print(f"   - Anomalies detected: {anomalies}/{total}")
            
            if result.get('results'):
                first_result = result['results'][0]
                print(f"   - Anomaly score: {first_result.get('anomaly_score', 0):.3f}")
                print(f"   - Is anomaly: {first_result.get('is_anomaly', False)}")
        else:
            print(f"\n❌ Detection failed: {result.get('error', 'Unknown error')}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Connection failed. Is the backend server running?")
        print("   Run: python webapp_backend.py")
        return False
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        return False
    
    return True

def test_batch_detection():
    """Test batch event anomaly detection without Claude"""
    print_header("TEST 2: Batch Event Detection (No Claude)")
    
    url = f"{API_BASE_URL}/api/anomaly/detect"
    
    # Multiple test events with varying characteristics
    events_data = {
        "events": [
            {"energy": 50, "s1": 100, "s2": 500, "s2s1Ratio": 5.0},
            {"energy": 200, "s1": 300, "s2": 10000, "s2s1Ratio": 33.3},  # Likely anomaly
            {"energy": 30, "s1": 80, "s2": 400, "s2s1Ratio": 5.0},
            {"energy": 100, "s1": 200, "s2": 1000, "s2s1Ratio": 5.0}
        ],
        "use_claude": False,
        "threshold": 0.3
    }
    
    try:
        print(f"POST {url}")
        print(f"Sending {len(events_data['events'])} events")
        
        response = requests.post(url, json=events_data, timeout=30)
        
        print(f"\nStatus Code: {response.status_code}")
        result = response.json()
        
        if result.get('success'):
            print("\n✅ Batch detection working!")
            anomalies = result.get('anomalies_detected', 0)
            total = result.get('total_events_analyzed', 0)
            rate = result.get('anomaly_rate', 0)
            print(f"   - Anomalies detected: {anomalies}/{total}")
            print(f"   - Anomaly rate: {rate*100:.1f}%")
            
            # Show details of detected anomalies
            if result.get('results'):
                print("\n   Detected Anomalies:")
                for i, anomaly in enumerate(result['results'][:3], 1):
                    print(f"      {i}. Event {anomaly.get('event_index', 'N/A')}")
                    print(f"         Score: {anomaly.get('anomaly_score', 0):.3f}")
                    print(f"         Flags: {len(anomaly.get('anomaly_flags', []))} detected")
        else:
            print(f"\n❌ Detection failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        return False
    
    return True

def test_dataset_analysis():
    """Test dataset analysis without Claude"""
    print_header("TEST 3: Dataset Analysis (No Claude)")
    
    url = f"{API_BASE_URL}/api/anomaly/analyze-dataset"
    
    params = {
        "max_events": 50,  # Analyze first 50 events
        "use_claude": False,
        "threshold": 0.3
    }
    
    try:
        print(f"POST {url}")
        print(f"Parameters: {json.dumps(params, indent=2)}")
        
        response = requests.post(url, json=params, timeout=60)
        
        print(f"\nStatus Code: {response.status_code}")
        result = response.json()
        
        if result.get('success'):
            print("\n✅ Dataset analysis working!")
            stats = result.get('statistics', {})
            print(f"   - Events analyzed: {stats.get('total_analyzed', 0)}")
            print(f"   - Anomalies found: {stats.get('anomalies_detected', 0)}")
            print(f"   - Anomaly rate: {stats.get('anomaly_rate', 0)*100:.1f}%")
            print(f"   - Avg score: {stats.get('avg_anomaly_score', 0):.3f}")
            
            # Show anomaly breakdown by type
            by_type = stats.get('by_type', {})
            if by_type:
                print("\n   Anomalies by Type:")
                for anom_type, count in by_type.items():
                    print(f"      - {anom_type}: {count}")
            
            # Show top anomalies
            top_anomalies = result.get('top_anomalies', [])
            if top_anomalies:
                print(f"\n   Top {min(3, len(top_anomalies))} Anomalies:")
                for i, anomaly in enumerate(top_anomalies[:3], 1):
                    print(f"      {i}. Event #{anomaly.get('event_index', 'N/A')}")
                    print(f"         Score: {anomaly.get('anomaly_score', 0):.3f}")
                    print(f"         Energy: {anomaly.get('energy', 0):.1f} keV")
                    print(f"         S2/S1 ratio: {anomaly.get('s2s1_ratio', 0):.2f}")
        else:
            print(f"\n❌ Analysis failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        return False
    
    return True

def main():
    print_header("ANOMALY DETECTION API TEST SUITE (No Claude)")
    print("Testing statistical anomaly detection without Claude AI\n")
    
    # Check if server is accessible
    try:
        response = requests.get(f"{API_BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running\n")
        else:
            print("⚠️  Backend server responded but with unexpected status")
    except:
        print("❌ Cannot connect to backend server!")
        print("   Please start the server first: python webapp_backend.py")
        sys.exit(1)
    
    # Run tests
    results = []
    results.append(("Single Event Detection", test_single_event_detection()))
    results.append(("Batch Detection", test_batch_detection()))
    results.append(("Dataset Analysis", test_dataset_analysis()))
    
    # Summary
    print_header("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    print(f"\n{'='*80}")
    print(f"Results: {passed}/{total} tests passed")
    print('='*80)
    
    sys.exit(0 if passed == total else 1)

if __name__ == "__main__":
    main()
