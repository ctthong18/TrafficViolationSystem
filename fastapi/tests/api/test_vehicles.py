import unittest

import requests

from tests.conftest import (
    BASE_URL,
    generate_random_5_digit_string,
    get_headers,
    log_test_case,
)
from tests.conftest import (
    test_data as shared_test_data,
)

# Use module-level test_data for unittest compatibility
test_data = shared_test_data()


class TestVehicles(unittest.TestCase):
    def test_01_register_vehicle(self):
        name = "Register Vehicle"
        suffix = generate_random_5_digit_string()
        test_data["plate"] = f"30H-{suffix}"
        url = f"{BASE_URL}/vehicles/"
        payload = {
            "license_plate": test_data["plate"],
            "vehicle_type": "car",
            "vehicle_color": "white",
            "vehicle_brand": "Toyota",
            "owner_name": "Nguyen Van A",
            "owner_identification": f"ID-{suffix}",
        }
        try:
            response = requests.post(
                url, headers=get_headers(test_data, with_auth=True), json=payload
            )
            self.assertEqual(
                response.status_code, 201, f"Expected 201, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(response_data.get("license_plate"), test_data["plate"])
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

    def test_02_list_all_vehicles(self):
        name = "List All Vehicles (Admin/Officer)"
        url = f"{BASE_URL}/vehicles/"
        params = {"skip": 0, "limit": 10}
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

    def test_03_get_my_vehicles(self):
        name = "Get My Vehicles"
        url = f"{BASE_URL}/vehicles/my-vehicles"
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

    def test_04_search_vehicle_by_license_plate(self):
        name = "Search Vehicle by License Plate"
        url = f"{BASE_URL}/vehicles/"
        params = {"license_plate": test_data["plate"]}
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
            self.assertEqual(response_data[0].get("license_plate"), test_data["plate"])
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

    def test_05_search_vehicle_by_owner_name(self):
        name = "Search Vehicle by Owner Name"
        url = f"{BASE_URL}/vehicles/"
        params = {"owner_name": "Nguyen"}
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
            for vehicle in response_data:
                self.assertIn(
                    "Nguyen",
                    vehicle.get("owner_name", ""),
                    "Owner name does not contain 'Nguyen'",
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

    def test_06_get_vehicle_by_license_plate(self):
        name = "Get Vehicle by License Plate"
        url = f"{BASE_URL}/vehicles/license-plate/{test_data['plate']}"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(response_data.get("license_plate"), test_data["plate"])
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
