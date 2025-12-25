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


class TestComplaints(unittest.TestCase):
    def test_01_create_complaint(self):
        name = "Create Complaint"
        suffix = generate_random_suffix()
        test_data["complaint_title"] = f"Test Complaint {suffix}"
        url = f"{BASE_URL}/complaints/"
        payload = {
            "title": test_data["complaint_title"],
            "description": "Testing complaint system",
            "complaint_type": "SYSTEM_ERROR",
            "is_anonymous": False,
        }
        try:
            response = requests.post(
                url, headers=get_headers(test_data, with_auth=True), json=payload
            )
            self.assertEqual(
                response.status_code, 201, f"Expected 201, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(response_data.get("title"), test_data["complaint_title"])
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

    def test_02_list_all_complaints(self):
        name = "List All Complaints"
        url = f"{BASE_URL}/complaints/"
        params = {"skip": 0, "limit": 10}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["complaints"]
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

    def test_03_get_my_complaints(self):
        name = "Get My Complaints"
        url = f"{BASE_URL}/complaints/my-complaints"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["complaints"]
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
        url = f"{BASE_URL}/complaints/assigned"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["complaints"]
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

    def test_05_filter_complaints_by_type(self):
        name = "Filter Complaints by Type"
        url = f"{BASE_URL}/complaints/"
        params = {"complaint_type": "SYSTEM_ERROR", "limit": 5}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["complaints"]
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            for complaint in response_data:
                self.assertEqual(
                    complaint.get("complaint_type"),
                    "SYSTEM_ERROR",
                    "Complaint type is not 'system_error'",
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

    def test_06_filter_complaints_by_status(self):
        name = "Filter Complaints by Status"
        url = f"{BASE_URL}/complaints/"
        params = {"status": "PENDING", "limit": 5}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["complaints"]
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            for complaint in response_data:
                self.assertEqual(
                    complaint.get("status"),
                    "PENDING",
                    "Complaint status is not 'pending'",
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
