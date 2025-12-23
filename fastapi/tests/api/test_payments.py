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


class TestPayments(unittest.TestCase):
    def test_01_deposit_to_wallet(self):
        name = "Deposit to Wallet"
        url = f"{BASE_URL}/payments/wallet/deposit"
        params = {"amount": 500000, "payment_method": "bank_transfer"}
        try:
            response = requests.post(
                url, headers=get_headers(test_data, with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue(
                "description" in response_data
            )  # Assuming a success message
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

    def test_02_get_wallet_summary(self):
        name = "Get Wallet Summary"
        url = f"{BASE_URL}/payments/wallet/summary"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("wallet_balance" in response_data)
            self.assertTrue("total_deposited" in response_data)
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

    def test_03_get_my_payments(self):
        name = "Get My Payments"
        url = f"{BASE_URL}/payments/my-payments"
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

    def test_04_filter_payments_by_type(self):
        name = "Filter Payments by Type"
        url = f"{BASE_URL}/payments/my-payments"
        params = {"payment_type": "deposit", "limit": 5}
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
            for payment in response_data:
                self.assertEqual(
                    payment.get("payment_type"),
                    "deposit",
                    "Payment type is not 'deposit'",
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
