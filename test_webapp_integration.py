#!/usr/bin/env python3
"""
Test script to verify anomaly detection is working correctly
"""

import requests
import json
import sys

def test_backend():
    """Test backend health"""
    print("=" * 80)
    print("🧪 TESTING BACKEND HEALTH")
    print("=" * 80)
    
    try:
        response = requests.get("http://localhost:5001/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is ONLINE")
            data = response.json()
            print(f"   Status: {data.get('status')}")
            print(f"   Message: {data.get('message')}")
            return True
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_dataset():
    """Test dataset loading"""
    print("\n" + "=" * 80)
    print("🧪 TESTING DATASET LOADING")
    print("=" * 80)
    
    try:
        response = requests.get("http://localhost:5001/api/dataset/load", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Dataset loaded successfully")
            print(f"   Total Events: {data['dataset']['totalEvents']:,}")
            print(f"   Classification Labels: {', '.join(data['dataset']['classificationLabels'])}")
            print(f"   Preview Events: {len(data['dataset']['preview'])}")
            return True
        else:
            print(f"❌ Dataset loading failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Dataset loading error: {e}")
        return False

def test_anomaly_detection():
    """Test anomaly detection with small dataset"""
    print("\n" + "=" * 80)
    print("🧪 TESTING ANOMALY DETECTION")
    print("=" * 80)
    
    try:
        payload = {
            "max_events": 50,
            "use_claude": True,
            "threshold": 0.2
        }
        
        print(f"📊 Analyzing {payload['max_events']} events with Claude AI...")
        print(f"   Threshold: {payload['threshold']}")
        print(f"   Please wait... (this may take 30-60 seconds)")
        
        response = requests.post(
            "http://localhost:5001/api/anomaly/analyze-dataset",
            json=payload,
            timeout=120
        )
        
        if response.status_code == 200:
            data = response.json()
            stats = data['statistics']
            
            print("\n✅ ANOMALY DETECTION SUCCESSFUL")
            print(f"\n📈 STATISTICS:")
            print(f"   Total Analyzed:      {stats['total_analyzed']}")
            print(f"   Anomalies Found:     {stats['anomalies_detected']}")
            print(f"   Anomaly Rate:        {stats['anomaly_rate']*100:.1f}%")
            print(f"   Avg Anomaly Score:   {stats['avg_anomaly_score']:.3f}")
            
            if stats['by_type']:
                print(f"\n🏷️  ANOMALIES BY TYPE:")
                for atype, count in stats['by_type'].items():
                    print(f"   {atype}: {count}")
            
            # Show top 3 anomalies
            if data['top_anomalies']:
                print(f"\n🔍 TOP 3 ANOMALIES:")
                for i, anomaly in enumerate(data['top_anomalies'][:3], 1):
                    print(f"\n   ANOMALY #{i}:")
                    print(f"   ├─ Event ID:      {anomaly['event_index']}")
                    print(f"   ├─ Severity:      {anomaly['severity']}")
                    print(f"   ├─ Score:         {anomaly['anomaly_score']:.3f}")
                    print(f"   ├─ Classification: {anomaly['classification']}")
                    print(f"   ├─ Confidence:    {anomaly['confidence']*100:.0f}%")
                    print(f"   ├─ Energy:        {anomaly['energy']:.3f} keV")
                    print(f"   ├─ S2/S1 Ratio:   {anomaly['s2s1_ratio']:.3f}")
                    print(f"   └─ Flags:         {anomaly['num_flags']} violation(s)")
                    
                    if anomaly.get('reasoning'):
                        reasoning_preview = anomaly['reasoning'][:100] + "..." if len(anomaly['reasoning']) > 100 else anomaly['reasoning']
                        print(f"      Reasoning: {reasoning_preview}")
            
            return True
        else:
            print(f"❌ Anomaly detection failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Anomaly detection error: {e}")
        return False

def test_single_event():
    """Test single event anomaly detection"""
    print("\n" + "=" * 80)
    print("🧪 TESTING SINGLE EVENT ANOMALY DETECTION")
    print("=" * 80)
    
    try:
        # Test with a potentially anomalous event
        payload = {
            "event_data": {
                "energy": 15.5,
                "s1": 45.2,
                "s2": 1500.0,
                "s2s1Ratio": 33.2
            },
            "use_claude": True,
            "threshold": 0.3
        }
        
        print(f"📊 Testing event with:")
        print(f"   Energy:      {payload['event_data']['energy']} keV")
        print(f"   S1:          {payload['event_data']['s1']} PE")
        print(f"   S2:          {payload['event_data']['s2']} PE")
        print(f"   S2/S1 Ratio: {payload['event_data']['s2s1Ratio']}")
        
        response = requests.post(
            "http://localhost:5001/api/anomaly/detect",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            result = data['results'][0]
            
            print("\n✅ SINGLE EVENT ANALYSIS COMPLETE")
            print(f"\n   Is Anomaly:       {'YES' if result['is_anomaly'] else 'NO'}")
            print(f"   Classification:   {result['classification']}")
            print(f"   Confidence:       {result['confidence']*100:.0f}%")
            print(f"   Anomaly Score:    {result['anomaly_score']:.3f}")
            print(f"   Flags:            {len(result['anomaly_flags'])}")
            
            if result.get('reasoning'):
                print(f"\n   Reasoning: {result['reasoning'][:150]}...")
            
            return True
        else:
            print(f"❌ Single event detection failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Single event detection error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("🚀 WEBAPP INTEGRATION TEST SUITE")
    print("=" * 80)
    print()
    
    results = {
        "Backend Health": test_backend(),
        "Dataset Loading": test_dataset(),
        "Anomaly Detection": test_anomaly_detection(),
        "Single Event Detection": test_single_event()
    }
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
    print("=" * 80)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name:.<40} {status}")
    
    total_passed = sum(results.values())
    total_tests = len(results)
    
    print("\n" + "=" * 80)
    print(f"TOTAL: {total_passed}/{total_tests} tests passed")
    print("=" * 80)
    
    if total_passed == total_tests:
        print("\n🎉 ALL TESTS PASSED! System is fully operational.")
        print("\n📱 Open http://localhost:8080 and navigate to Anomaly Detection page")
        print("🔬 Click 'Start Analysis' to see the scientific report!")
        return 0
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
