import unittest

import requests

from tests.conftest import (
    BASE_URL,
    generate_random_suffix,
    get_headers,
    log_test_case,
)
from tests.conftest import (
    test_data as shared_test_data,
)

# Use module-level test_data for unittest compatibility
test_data = shared_test_data()


class TestDrivingLicenses(unittest.TestCase):
    def test_01_create_driving_license(self):
        name = "Create Driving License"
        suffix = generate_random_suffix()
        test_data["license_number"] = f"LIC-{suffix}"

        # First, delete existing license if any
        try:
            get_url = f"{BASE_URL}/driving-licenses/my-license"
            get_response = requests.get(
                get_url, headers=get_headers(test_data, with_auth=True)
            )
            if get_response.status_code == 200 and get_response.json():
                existing_license = get_response.json()
                if existing_license and "id" in existing_license:
                    delete_url = f"{BASE_URL}/driving-licenses/{existing_license['id']}"
                    requests.delete(
                        delete_url, headers=get_headers(test_data, with_auth=True)
                    )
        except:
            pass  # If deletion fails, continue anyway

        url = f"{BASE_URL}/driving-licenses/"
        payload = {
            "license_number": test_data["license_number"],
            "license_class": "B2",
            "full_name": "Nguyen Van A",
            "date_of_birth": "1990-01-01",
            "issue_date": "2020-01-01",
            "expiry_date": "2030-01-01",
        }
        try:
            response = requests.post(
                url, headers=get_headers(test_data, with_auth=True), json=payload
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(
                response_data.get("license_number"), test_data["license_number"]
            )
            # Store the license ID for later tests
            test_data["license_id"] = response_data.get("id")
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

    def test_02_get_my_driving_license(self):
        name = "Get My Driving License"
        url = f"{BASE_URL}/driving-licenses/my-license"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("license_number" in response_data)
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

    def test_03_check_license_status(self):
        name = "Check License Status"
        # Use the license number created in test_01
        license_to_check = test_data.get("license_number")
        if not license_to_check:
            self.skipTest("License number not created in previous step.")
            return

        url = f"{BASE_URL}/driving-licenses/{license_to_check}/status"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("status" in response_data)
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
