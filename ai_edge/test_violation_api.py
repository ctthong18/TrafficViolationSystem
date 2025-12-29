"""
Test script to verify violation creation API works correctly
"""

import os
from datetime import datetime

import requests

# Configuration
API_URL = os.getenv("API_URL", "http://localhost:8000/api/v1")
AUTH_URL = os.getenv("AUTH_URL", "http://localhost:8000/api/v1/login")
CAMERA_ID = os.getenv("CAMERA_ID", "CAM-HN-002")
PASSWORD = os.getenv("CAMERA_PASSWORD", "camera123")


def test_violation_creation():
    """Test violation creation with camera credentials"""
    print("=" * 60)
    print("Testing Violation Creation API")
    print("=" * 60)

    # Step 1: Login
    print("\n1. Authenticating as camera...")
    try:
        payload = {"username_or_email": CAMERA_ID, "password": PASSWORD}
        response = requests.post(AUTH_URL, json=payload, timeout=10)

        if response.status_code != 200:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False

        data = response.json()
        token = data.get("access_token")
        user = data.get("user", {})

        print(f"✅ Authenticated as: {user.get('full_name')}")
        print(f"   Role: {user.get('role')}")
        print(f"   Username: {user.get('username')}")

    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return False

    # Step 2: Test GET violations (permission check)
    print("\n2. Testing GET violations endpoint...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{API_URL}/violations/?limit=5", headers=headers, timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            print(f"✅ GET violations works")
            print(f"   Found {data.get('total', 0)} violations in database")
        elif response.status_code == 403:
            print(f"❌ Permission denied! User role may be incorrect.")
            return False
        else:
            print(f"⚠️  Unexpected status: {response.status_code}")

    except Exception as e:
        print(f"❌ GET request error: {e}")
        return False

    # Step 3: Create a test violation
    print("\n3. Creating test violation...")
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        violation_payload = {
            "license_plate": "30F-99999",
            "violation_type": "SPEED_10_20",
            "latitude": 21.028511,
            "longitude": 105.804817,
            "location_name": "Hanoi Test Location",
            "camera_id": CAMERA_ID,
            "detected_at": datetime.now().isoformat(),
            "confidence_score": 0.95,
            "evidence_images": ["https://picsum.photos/800/600"],
            "ai_metadata": {"test": True, "source": "test_script"},
        }

        print(f"   Payload: {violation_payload}")

        response = requests.post(
            f"{API_URL}/violations/",
            json=violation_payload,
            headers=headers,
            timeout=10,
        )

        print(f"   Response Status: {response.status_code}")

        if response.status_code in [200, 201]:
            result = response.json()
            print(f"✅ Violation created successfully!")
            print(f"   Violation ID: {result.get('id')}")
            print(f"   License Plate: {result.get('license_plate')}")
            print(f"   Status: {result.get('status')}")
            print(f"   Created At: {result.get('created_at')}")
            return True
        else:
            print(f"❌ Violation creation failed!")
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text}")

            # Try to parse error details
            try:
                error_data = response.json()
                print(f"   Error Detail: {error_data.get('detail', 'Unknown')}")
            except:
                pass

            return False

    except requests.exceptions.Timeout:
        print(f"❌ Request timeout (10s)")
        return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to {API_URL}")
        print(f"   Make sure the backend server is running!")
        return False
    except Exception as e:
        print(f"❌ Error creating violation: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n🚀 Starting API Test...\n")
    success = test_violation_creation()

    print("\n" + "=" * 60)
    if success:
        print("✅ ALL TESTS PASSED")
    else:
        print("❌ TESTS FAILED")
    print("=" * 60 + "\n")
