import unittest

import requests

from tests.conftest import (
    BASE_URL,
    get_headers,
    log_test_case,
)
from tests.conftest import (
    test_data as shared_test_data,
)

# Use module-level test_data for unittest compatibility
test_data = shared_test_data()


class TestViolations(unittest.TestCase):
    def test_01_list_all_violations(self):
        name = "List All Violations"
        url = f"{BASE_URL}/violations/"
        params = {"skip": 0, "limit": 10}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["violations"]
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

    def test_02_filter_violations_by_status_pending(self):
        name = "Filter Violations by Status=pending"
        url = f"{BASE_URL}/violations/"
        params = {"status": "PENDING", "limit": 5}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["violations"]
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            for violation in response_data:
                self.assertEqual(
                    violation.get("status"),
                    "PENDING",
                    "Violation status is not 'PENDING'",
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

    def test_03_search_violations_by_license_plate(self):
        name = "Search Violations by License Plate"
        # Use the plate created in TestVehicles
        plate_to_search = test_data.get("plate")
        if not plate_to_search:
            self.skipTest("Vehicle plate not created in previous step.")
            return

        url = f"{BASE_URL}/violations/"
        params = {"license_plate": plate_to_search}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["violations"]
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            if response_data:  # Only assert if data is returned
                self.assertEqual(response_data[0].get("license_plate"), plate_to_search)
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

    def test_04_get_processed_violations(self):
        name = "Get Processed Violations"
        url = f"{BASE_URL}/violations/processed/list"
        params = {"skip": 0, "limit": 10}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["violations"]
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            for violation in response_data:
                self.assertEqual(
                    violation.get("status"),
                    "processed",
                    "Violation status is not 'processed'",
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

    def test_05_get_recent_violations(self):
        name = "Get Recent Violations (for dashboard)"
        url = f"{BASE_URL}/violations/recent"
        params = {"limit": 5}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            self.assertTrue(
                len(response_data) <= 5, "More than limit recent violations returned"
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


if __name__ == "__main__":
    unittest.main()
