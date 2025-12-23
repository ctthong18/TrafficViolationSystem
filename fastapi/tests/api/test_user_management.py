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


class TestUserManagement(unittest.TestCase):
    def test_01_list_all_users(self):
        name = "List All Users (/admin/users)"
        url = f"{BASE_URL}/admin/users"
        params = {"skip": 0, "limit": 10}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["users"]
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            self.assertTrue(len(response_data) <= 10, "More than limit users returned")
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

    def test_02_filter_users_by_role_officer(self):
        name = "Filter Users by Role=officer"
        url = f"{BASE_URL}/admin/users"
        params = {"role": "officer", "limit": 5}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["users"]
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            for user in response_data:
                self.assertEqual(
                    user.get("role"), "officer", "User role is not 'officer'"
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

    def test_03_get_admin_dashboard_stats(self):
        name = "Get Admin Dashboard Stats"
        url = f"{BASE_URL}/admin/dashboard/stats"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("total_users" in response_data)
            self.assertTrue("total_officers" in response_data)
            self.assertTrue("total_citizens" in response_data)
            self.assertTrue("system_health" in response_data)
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

    def test_04_list_all_users_simple(self):
        name = "List All Users (Simple) (/users)"
        url = f"{BASE_URL}/users"
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


if __name__ == "__main__":
    unittest.main()
