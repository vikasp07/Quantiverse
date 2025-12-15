"""
Test script to verify enrollment endpoints are working
Run this after starting Flask server: python app.py
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_enroll():
    """Test enrollment endpoint"""
    print("\n🧪 Testing Enrollment Endpoint...")
    
    enrollment_data = {
        "user_id": "test-user-123",
        "user_name": "Test User",
        "user_email": "test@example.com",
        "internship_id": "1",
        "internship_name": "Test Internship"
    }
    
    response = requests.post(f"{BASE_URL}/enroll", json=enrollment_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.status_code == 201

def test_enrollment_status():
    """Test enrollment status check"""
    print("\n🔍 Testing Enrollment Status Endpoint...")
    
    params = {
        "user_id": "test-user-123",
        "internship_id": "1"
    }
    
    response = requests.get(f"{BASE_URL}/enrollment-status", params=params)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.status_code == 200

def test_get_candidates():
    """Test get candidates endpoint"""
    print("\n👥 Testing Get Candidates Endpoint...")
    
    internship_id = "1"
    response = requests.get(f"{BASE_URL}/admin/internships/{internship_id}/candidates")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.status_code == 200

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 Starting Enrollment API Tests")
    print("=" * 50)
    
    try:
        # Test 1: Enroll a user
        if test_enroll():
            print("✅ Enrollment test passed")
        else:
            print("❌ Enrollment test failed")
        
        # Test 2: Check enrollment status
        if test_enrollment_status():
            print("✅ Status check test passed")
        else:
            print("❌ Status check test failed")
        
        # Test 3: Get candidates list
        if test_get_candidates():
            print("✅ Get candidates test passed")
        else:
            print("❌ Get candidates test failed")
            
        print("\n" + "=" * 50)
        print("✅ All tests completed!")
        print("=" * 50)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to Flask server")
        print("Make sure Flask is running on http://127.0.0.1:5000")
        print("Run: cd backend && python app.py")
