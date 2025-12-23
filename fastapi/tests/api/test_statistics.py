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


class TestStatistics(unittest.TestCase):
    def test_01_get_statistics_7_days(self):
        name = "Get Statistics (7 days)"
        url = f"{BASE_URL}/statistics"
        params = {"date_range": "7days"}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
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

    def test_02_get_statistics_30_days(self):
        name = "Get Statistics (30 days)"
        url = f"{BASE_URL}/statistics"
        params = {"date_range": "30days"}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
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

    def test_03_get_statistics_3_months(self):
        name = "Get Statistics (3 months)"
        url = f"{BASE_URL}/statistics"
        params = {"date_range": "3months"}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
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

    def test_04_get_statistics_year(self):
        name = "Get Statistics (year)"
        url = f"{BASE_URL}/statistics"
        params = {"date_range": "year"}
        try:
            response = requests.get(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
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


if __name__ == "__main__":
    unittest.main()
