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
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("Health check: OK")
            return True
        else:
            print(f"Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"Health check error: {e}")
        return False

def test_root_endpoint():
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"Root endpoint: {data.get('message', 'OK')}")
            return True
        else:
            print(f"Root endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"Root endpoint error: {e}")
        return False

def test_login():
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json=ADMIN_CREDENTIALS
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            if token:
                print("Login: OK")
                return token
            else:
                print("Login failed: No token in response")
                return None
        else:
            print(f"Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_protected_endpoint(token):
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/api/v1/admin/users",
            headers=headers
        )
        if response.status_code == 200:
            print("Protected endpoint: OK")
            return True
        else:
            print(f"Protected endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"Protected endpoint error: {e}")
        return False

def test_api_docs():
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("API docs: Available at /docs")
            return True
        else:
            print(f"API docs failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"API docs error: {e}")
        return False

def main():
    print("Bắt đầu test Traffic Violation System API")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 5
    
    # Health check
    print("\nTesting health check...")
    if test_health_check():
        tests_passed += 1
    
    # Root endpoint
    print("\nTesting root endpoint...")
    if test_root_endpoint():
        tests_passed += 1
    
    # API docs
    print("\nTesting API documentation...")
    if test_api_docs():
        tests_passed += 1
    
    # Login
    print("\nTesting login...")
    token = test_login()
    if token:
        tests_passed += 1
        
        # Protected endpoint
        print("\nTesting protected endpoint...")
        if test_protected_endpoint(token):
            tests_passed += 1
    else:
        print("\nSkipping protected endpoint test (no token)")
    
    # Kết quả
    print("\n" + "=" * 60)
    print(f"Kết quả test: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("PASSED!")
        print(f"   - API Base: {BASE_URL}")
        print(f"   - Documentation: {BASE_URL}/docs")
        print(f"   - Health Check: {BASE_URL}/health")
        print(f"   - Admin Login: admin / admin123")
    else:
        print("FAILED")
    
    return tests_passed == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

