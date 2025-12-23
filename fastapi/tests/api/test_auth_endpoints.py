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


class TestAuthentication(unittest.TestCase):
    def test_01_register_admin(self):
        name = "Register Admin User"
        url = f"{BASE_URL}/register"
        payload = {
            "username": test_data["admin_user"],
            "email": test_data["admin_email"],
            "password": test_data["admin_pass"],
            "full_name": "System Admin",
            "role": "admin",
            "phone_number": "0900000001",
        }
        try:
            response = requests.post(url, headers=get_headers(), json=payload)
            if response.json()["detail"] == "Tên đăng nhập đã tồn tại":
                # User already exists, treat as pass
                log_test_case(name, "PASS")
                return
            self.assertEqual(
                response.status_code, 201, f"Expected 201, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("user_id" in response_data, "user_id not found in response")
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

    def test_02_login_admin(self):
        name = "Login Admin"
        url = f"{BASE_URL}/login"
        payload = {
            "username_or_email": test_data["admin_user"],
            "password": test_data["admin_pass"],
        }
        try:
            response = requests.post(url, headers=get_headers(), json=payload)
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue(
                "access_token" in response_data, "access_token not found in response"
            )
            test_data["access_token"] = response_data["access_token"]
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

    def test_03_get_current_user_info(self):
        name = "Get Current User Info (/me)"
        url = f"{BASE_URL}/me"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(response_data.get("username"), test_data["admin_user"])
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

    def test_04_register_citizen_user(self):
        name = "Register Citizen User"
        suffix = generate_random_suffix()
        test_data["cit_user"] = f"citizen_{suffix}"
        test_data["cit_email"] = f"citizen_{suffix}@test.com"
        url = f"{BASE_URL}/register"
        payload = {
            "username": test_data["cit_user"],
            "email": test_data["cit_email"],
            "password": "Citizen123",
            "full_name": f"Test Citizen {suffix}",
            "role": "citizen",
            "phone_number": f"0901111{suffix[-4:]}",
            "identification_number": f"CIT-{suffix}",
        }
        try:
            response = requests.post(url, headers=get_headers(), json=payload)
            self.assertEqual(
                response.status_code, 201, f"Expected 201, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("user_id" in response_data, "user_id not found in response")
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

    def test_05_register_officer_user(self):
        name = "Register Officer User"
        suffix = generate_random_suffix()
        test_data["off_user"] = f"officer_{suffix}"
        test_data["off_email"] = f"officer_{suffix}@police.gov"
        url = f"{BASE_URL}/admin/users/officers"
        payload = {
            "username": test_data["off_user"],
            "email": test_data["off_email"],
            "full_name": f"Officer {suffix}",
            "identification_number": f"OFF-{suffix}",
            "password": "Officer123",
            "role": "officer",
            "badge_number": f"B-{suffix}",
            "department": "Traffic Control",
        }
        try:
            response = requests.post(
                url, headers=get_headers(test_data, with_auth=True), json=payload
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("id" in response_data, "user_id not found in response")
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
