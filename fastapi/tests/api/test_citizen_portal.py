import unittest
from datetime import datetime

import requests

from tests.conftest import (
    BASE_URL,
    generate_random_5_digit_string,
    get_headers,
    log_test_case,
)
from tests.conftest import (
    test_data as shared_test_data,
)

# Use module-level test_data for unittest compatibility
test_data = shared_test_data()


class TestCitizenPortal(unittest.TestCase):
    # Note: Citizen tests might require logging in as a citizen user.
    # For simplicity, these tests will use the admin token, assuming it has sufficient permissions.
    # A more complete test suite would involve creating a citizen user and logging in as them.

    def test_01_get_my_violations(self):
        name = "Get My Violations (Citizen)"
        url = f"{BASE_URL}/citizen/my-violations"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            log_test_case(name, "PASS")
        except Exception as e:
            msg = str(e)
            if "response" in locals():
                try:
                    msg += f" | Response: {response.text}"
                except:
                    pass
            log_test_case(name, "FAIL", msg)
            self.fail(msg)

    def test_02_get_my_vehicles(self):
        name = "Get My Vehicles (Citizen)"
        url = f"{BASE_URL}/citizen/my-vehicles"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            log_test_case(name, "PASS")
        except Exception as e:
            msg = str(e)
            if "response" in locals():
                try:
                    msg += f" | Response: {response.text}"
                except:
                    pass
            log_test_case(name, "FAIL", msg)
            self.fail(msg)

    def test_03_get_citizen_dashboard_stats(self):
        name = "Get Citizen Dashboard Stats"
        url = f"{BASE_URL}/citizen/dashboard/stats"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("total_violations" in response_data)
            self.assertTrue("total_fines" in response_data)
            log_test_case(name, "PASS")
        except Exception as e:
            msg = str(e)
            if "response" in locals():
                try:
                    msg += f" | Response: {response.text}"
                except:
                    pass
            log_test_case(name, "FAIL", msg)
            self.fail(msg)

    def test_04_get_personal_info(self):
        name = "Get Personal Info"
        url = f"{BASE_URL}/citizen/personal-info"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("fullName" in response_data)
            self.assertTrue("email" in response_data)
            log_test_case(name, "PASS")
        except Exception as e:
            msg = str(e)
            if "response" in locals():
                try:
                    msg += f" | Response: {response.text}"
                except:
                    pass
            log_test_case(name, "FAIL", msg)
            self.fail(msg)

    def test_05_create_vehicle_citizen(self):
        name = "Create Vehicle (Citizen)"
        suffix = generate_random_5_digit_string()
        license_plate = f"29B-{suffix}"
        url = f"{BASE_URL}/vehicles/"
        payload = {
            "license_plate": license_plate,
            "vehicle_type": "motorcycle",
            "vehicle_color": "black",
            "vehicle_brand": "Yamaha",
            "owner_name": "Nguyen Van B",
            "owner_identification": f"ID-{suffix}",
        }
        try:
            response = requests.post(
                url, headers=get_headers(test_data, with_auth=True), json=payload
            )
            self.assertEqual(
                response.status_code, 201, f"Expected 201, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(response_data.get("license_plate"), license_plate)
            log_test_case(name, "PASS")
        except Exception as e:
            msg = str(e)
            if "response" in locals():
                try:
                    msg += f" | Response: {response.text}"
                except:
                    pass
            log_test_case(name, "FAIL", msg)
            self.fail(msg)

    def test_06_register_vehicle_citizen(self):
        name = "Register Vehicle (Citizen)"
        # Generate unique 5-digit suffix from current timestamp
        suffix = str(int(datetime.now().timestamp() * 1000000) % 100000).zfill(5)
        license_plate = f"51F-{suffix}"
        url = f"{BASE_URL}/citizen/vehicles"
        payload = {
            "license_plate": license_plate,
            "vehicle_type": "motorcycle",
            "vehicle_color": "red",
            "vehicle_brand": "Honda",
            "owner_name": "Test User",
            "owner_identification": "ID-TEST",
        }
        try:
            response = requests.post(
                url, headers=get_headers(test_data, with_auth=True), json=payload
            )
            self.assertEqual(
                response.status_code, 201, f"Expected 201, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(response_data.get("license_plate"), license_plate)
            log_test_case(name, "PASS")
        except Exception as e:
            msg = str(e)
            if "response" in locals():
                try:
                    msg += f" | Response: {response.text}"
                except:
                    pass
            log_test_case(name, "FAIL", msg)
            self.fail(msg)


if __name__ == "__main__":
    unittest.main()
