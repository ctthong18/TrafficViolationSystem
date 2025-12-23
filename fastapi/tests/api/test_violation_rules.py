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


class TestViolationRules(unittest.TestCase):
    def test_01_create_violation_rule(self):
        name = "Create Violation Rule"
        suffix = generate_random_suffix()
        test_data["violation_code"] = f"SPEED-{suffix}"
        url = f"{BASE_URL}/violation-rules/"
        payload = {
            "code": test_data["violation_code"],
            "description": "Speeding over 20km/h",
            "law_reference": "ND100/2019",
            "fine_min_car": 3000000,
            "fine_max_car": 5000000,
            "points_car": 2,
        }
        try:
            response = requests.post(
                url, headers=get_headers(test_data, with_auth=True), json=payload
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(response_data.get("code"), test_data["violation_code"])
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

    def test_02_list_violation_rules(self):
        name = "List Violation Rules"
        url = f"{BASE_URL}/violation-rules/"
        params = {"skip": 0, "limit": 10}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["items"]
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

    def test_03_search_violation_rules(self):
        name = "Search Violation Rules"
        url = f"{BASE_URL}/violation-rules/"
        params = {"search": "SPEED", "limit": 5}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["items"]
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            for rule in response_data:
                self.assertIn(
                    "SPEED",
                    rule.get("code", ""),
                    "Violation code does not contain 'SPEED'",
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
