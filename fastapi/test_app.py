#!/usr/bin/env python3
"""
Script test ứng dụng Traffic Violation System
"""

import sys
import requests
import json
from datetime import datetime

# Cấu hình
BASE_URL = "http://localhost:8000"
ADMIN_CREDENTIALS = {
    "username": "admin",
    "password": "admin123"
}

def test_health_check():
    """Test health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check: OK")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_root_endpoint():
    """Test root endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root endpoint: {data.get('message', 'OK')}")
            return True
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False

def test_login():
    """Test login endpoint"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json=ADMIN_CREDENTIALS
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            if token:
                print("✅ Login: OK")
                return token
            else:
                print("❌ Login failed: No token in response")
                return None
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_protected_endpoint(token):
    """Test protected endpoint với token"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/api/v1/admin/users",
            headers=headers
        )
        if response.status_code == 200:
            print("✅ Protected endpoint: OK")
            return True
        else:
            print(f"❌ Protected endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Protected endpoint error: {e}")
        return False

def test_api_docs():
    """Test API documentation"""
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ API docs: Available at /docs")
            return True
        else:
            print(f"❌ API docs failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API docs error: {e}")
        return False

def main():
    """Hàm chính test ứng dụng"""
    print("🧪 Bắt đầu test Traffic Violation System API")
    print("=" * 60)
    print(f"📡 Base URL: {BASE_URL}")
    print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 5
    
    # Test 1: Health check
    print("\n1️⃣ Testing health check...")
    if test_health_check():
        tests_passed += 1
    
    # Test 2: Root endpoint
    print("\n2️⃣ Testing root endpoint...")
    if test_root_endpoint():
        tests_passed += 1
    
    # Test 3: API docs
    print("\n3️⃣ Testing API documentation...")
    if test_api_docs():
        tests_passed += 1
    
    # Test 4: Login
    print("\n4️⃣ Testing login...")
    token = test_login()
    if token:
        tests_passed += 1
        
        # Test 5: Protected endpoint
        print("\n5️⃣ Testing protected endpoint...")
        if test_protected_endpoint(token):
            tests_passed += 1
    else:
        print("\n5️⃣ Skipping protected endpoint test (no token)")
    
    # Kết quả
    print("\n" + "=" * 60)
    print(f"📊 Kết quả test: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 Tất cả tests đều PASSED!")
        print("\n📋 Ứng dụng đã sẵn sàng:")
        print(f"   - API Base: {BASE_URL}")
        print(f"   - Documentation: {BASE_URL}/docs")
        print(f"   - Health Check: {BASE_URL}/health")
        print(f"   - Admin Login: admin / admin123")
    else:
        print("⚠️  Một số tests FAILED. Kiểm tra lại ứng dụng.")
    
    return tests_passed == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

