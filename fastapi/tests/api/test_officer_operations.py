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


class TestOfficerOperations(unittest.TestCase):
    def test_01_get_review_queue(self):
        name = "Get Review Queue (Officer)"
        url = f"{BASE_URL}/officer/violations/review-queue"
        params = {"skip": 0, "limit": 10}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()

            # Updated to handle paginated response (dict) containing a 'violations' list
            if isinstance(response_data, dict) and "violations" in response_data:
                self.assertTrue(
                    isinstance(response_data["violations"], list),
                    "Response 'violations' key should be a list",
                )
            else:
                # Fallback for flat list response
                self.assertTrue(
                    isinstance(response_data, list),
                    f"Response should be a list or paginated dict. Got: {type(response_data)}",
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

    def test_02_get_officer_dashboard_stats(self):
        name = "Get Officer Dashboard Stats"
        url = f"{BASE_URL}/officer/dashboard/stats"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
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

    def test_03_get_officer_activities(self):
        name = "Get Officer Activities"
        url = f"{BASE_URL}/officer/dashboard/activities"
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

    def test_04_get_assigned_complaints(self):
        name = "Get Assigned Complaints"
        url = f"{BASE_URL}/officer/complaints/assigned"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = (
                response.json()
            )  # Remove ["complaints"] - it's already a list
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


if __name__ == "__main__":
    unittest.main()
