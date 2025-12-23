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


class TestDenunciations(unittest.TestCase):
    def test_01_create_denunciation(self):
        name = "Create Denunciation"
        suffix = generate_random_suffix()
        test_data["denunciation_title"] = f"Traffic Violation Report {suffix}"
        url = f"{BASE_URL}/denunciations/"
        payload = {
            "title": test_data["denunciation_title"],
            "description": "Reporting dangerous driving",
            "denunciation_type": "OTHER_ILLEGAL",
            "is_anonymous": True,
            "severity_level": "high",
        }
        try:
            response = requests.post(
                url, headers=get_headers(test_data, with_auth=True), json=payload
            )
            self.assertEqual(
                response.status_code, 201, f"Expected 201, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(
                response_data.get("title"), test_data["denunciation_title"]
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

    def test_02_list_denunciations(self):
        name = "List Denunciations"
        url = f"{BASE_URL}/denunciations/"
        params = {"skip": 0, "limit": 10}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["denunciations"]
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

    def test_03_get_assigned_denunciations(self):
        name = "Get Assigned Denunciations"
        url = f"{BASE_URL}/denunciations/assigned"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["denunciations"]
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
