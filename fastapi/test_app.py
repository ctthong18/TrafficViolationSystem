import io
import json
import logging
import os
import sys
import unittest
from datetime import datetime

import coloredlogs
import requests

if sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")


# Configuration
BASE_URL = "http://localhost:8000/api/v1"
LOG_FILE = "test_suite.log"
REPORT_FILE = "test_summary.txt"

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, mode="w", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)

# --- Test Data Storage ---
test_data = {
    "access_token": None,
    "admin_user": "admin",
    "admin_pass": "admin123",
    "admin_email": "admin@gmail.com",
    "cit_user": None,
    "cit_email": None,
    "off_user": None,
    "off_email": None,
    "cam_id": None,
    "plate": None,
    "license_number": None,
    "license_id": None,
    "violation_code": None,
    "complaint_title": None,
    "denunciation_title": None,
}


# --- Helper Functions ---
def get_headers(with_auth=False):
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if with_auth and test_data["access_token"]:
        headers["Authorization"] = f"Bearer {test_data['access_token']}"
    return headers


def generate_random_suffix():
    return datetime.now().strftime("%Y%m%d%H%M%S%f")


five_digit_string = datetime.now().strftime("%f")[-5:]


def generate_random_5_digit_string():
    return five_digit_string


def log_test_case(name, status, details=""):
    if status == "PASS":
        logging.info(f"PASS: {name}")
    else:
        logging.error(f"FAIL: {name} - {details}")
    return status == "PASS"


coloredlogs.install(
    level="INFO",
    fmt="%(asctime)s - %(levelname)s - %(message)s",
    level_styles={"info": {"color": "green"}, "error": {"color": "red"}},
)


# --- Test Classes ---


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
            response = requests.get(url, headers=get_headers(with_auth=True))
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
                url, headers=get_headers(with_auth=True), json=payload
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


class TestUserManagement(unittest.TestCase):
    def test_01_list_all_users(self):
        name = "List All Users (/admin/users)"
        url = f"{BASE_URL}/admin/users"
        params = {"skip": 0, "limit": 10}
        try:
            response = requests.get(
                url, headers=get_headers(with_auth=True), params=params
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
                url, headers=get_headers(with_auth=True), params=params
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
            response = requests.get(url, headers=get_headers(with_auth=True))
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
            response = requests.get(url, headers=get_headers(with_auth=True))
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


class TestCameras(unittest.TestCase):
    def test_01_create_camera(self):
        name = "Create Camera"
        suffix = generate_random_suffix()
        test_data["cam_id"] = f"CAM-{suffix}"
        url = f"{BASE_URL}/cameras/"
        payload = {
            "camera_id": test_data["cam_id"],
            "name": f"Camera {suffix}",
            "location_name": "Hanoi Downtown",
            "latitude": 21.0285,
            "longitude": 105.8542,
            "camera_type": "ANPR",
            "resolution": "4K",
            "status": "online",
        }
        try:
            response = requests.post(
                url, headers=get_headers(with_auth=True), json=payload
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(response_data.get("camera_id"), test_data["cam_id"])
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

    def test_02_list_cameras(self):
        name = "List Cameras"
        url = f"{BASE_URL}/cameras/"
        params = {"skip": 0, "limit": 10}
        try:
            response = requests.get(
                url, headers=get_headers(with_auth=True), params=params
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

    def test_03_get_camera_detail(self):
        name = "Get Camera Detail"
        url = f"{BASE_URL}/cameras/{test_data['cam_id']}"
        try:
            response = requests.get(url, headers=get_headers(with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(response_data.get("camera_id"), test_data["cam_id"])
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

    def test_04_filter_cameras_by_status_online(self):
        name = "Filter Cameras by Status=online"
        url = f"{BASE_URL}/cameras/"
        params = {"status": "online", "limit": 5}
        try:
            response = requests.get(
                url, headers=get_headers(with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["items"]
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            for cam in response_data:
                self.assertEqual(
                    cam.get("status"), "online", "Camera status is not 'online'"
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

    def test_05_search_cameras_by_name(self):
        name = "Search Cameras by Name"
        url = f"{BASE_URL}/cameras/"
        params = {"search": "Camera", "limit": 5}
        try:
            response = requests.get(
                url, headers=get_headers(with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["items"]
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            for cam in response_data:
                self.assertIn(
                    "Camera",
                    cam.get("name", ""),
                    "Camera name does not contain 'Camera'",
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

    def test_06_update_camera_status(self):
        name = "Update Camera Status"
        url = f"{BASE_URL}/cameras/{test_data['cam_id']}"
        payload = {"status": "maintenance"}
        try:
            response = requests.put(
                url, headers=get_headers(with_auth=True), json=payload
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(response_data.get("status"), "maintenance")
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
                url, headers=get_headers(with_auth=True), json=payload
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
                url, headers=get_headers(with_auth=True), params=params
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
                url, headers=get_headers(with_auth=True), params=params
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
                url, headers=get_headers(with_auth=True), json=payload
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
                url, headers=get_headers(with_auth=True), params=params
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
            response = requests.get(url, headers=get_headers(with_auth=True))
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
                url, headers=get_headers(with_auth=True), params=params
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
                url, headers=get_headers(with_auth=True), params=params
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
            response = requests.get(url, headers=get_headers(with_auth=True))
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


class TestDrivingLicenses(unittest.TestCase):
    def test_01_create_driving_license(self):
        name = "Create Driving License"
        suffix = generate_random_suffix()
        test_data["license_number"] = f"LIC-{suffix}"

        # First, delete existing license if any
        try:
            get_url = f"{BASE_URL}/driving-licenses/my-license"
            get_response = requests.get(get_url, headers=get_headers(with_auth=True))
            if get_response.status_code == 200 and get_response.json():
                existing_license = get_response.json()
                if existing_license and "id" in existing_license:
                    delete_url = f"{BASE_URL}/driving-licenses/{existing_license['id']}"
                    requests.delete(delete_url, headers=get_headers(with_auth=True))
        except:
            pass  # If deletion fails, continue anyway

        url = f"{BASE_URL}/driving-licenses/"
        payload = {
            "license_number": test_data["license_number"],
            "license_class": "B2",
            "full_name": "Nguyen Van A",
            "date_of_birth": "1990-01-01",
            "issue_date": "2020-01-01",
            "expiry_date": "2030-01-01",
        }
        try:
            response = requests.post(
                url, headers=get_headers(with_auth=True), json=payload
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(
                response_data.get("license_number"), test_data["license_number"]
            )
            # Store the license ID for later tests
            test_data["license_id"] = response_data.get("id")
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

    def test_02_get_my_driving_license(self):
        name = "Get My Driving License"
        url = f"{BASE_URL}/driving-licenses/my-license"
        try:
            response = requests.get(url, headers=get_headers(with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("license_number" in response_data)
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

    def test_03_check_license_status(self):
        name = "Check License Status"
        # Use the license number created in test_01
        license_to_check = test_data.get("license_number")
        if not license_to_check:
            self.skipTest("License number not created in previous step.")
            return

        url = f"{BASE_URL}/driving-licenses/{license_to_check}/status"
        try:
            response = requests.get(url, headers=get_headers(with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("status" in response_data)
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


class TestViolations(unittest.TestCase):
    def test_01_list_all_violations(self):
        name = "List All Violations"
        url = f"{BASE_URL}/violations/"
        params = {"skip": 0, "limit": 10}
        try:
            response = requests.get(
                url, headers=get_headers(with_auth=True), params=params
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
                url, headers=get_headers(with_auth=True), params=params
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
                url, headers=get_headers(with_auth=True), params=params
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
                url, headers=get_headers(with_auth=True), params=params
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
                url, headers=get_headers(with_auth=True), params=params
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


class TestOfficerOperations(unittest.TestCase):
    def test_01_get_review_queue(self):
        name = "Get Review Queue (Officer)"
        url = f"{BASE_URL}/officer/violations/review-queue"
        params = {"skip": 0, "limit": 10}
        try:
            response = requests.get(
                url, headers=get_headers(with_auth=True), params=params
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
            response = requests.get(url, headers=get_headers(with_auth=True))
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
            response = requests.get(url, headers=get_headers(with_auth=True))
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
            response = requests.get(url, headers=get_headers(with_auth=True))
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


class TestCitizenPortal(unittest.TestCase):
    # Note: Citizen tests might require logging in as a citizen user.
    # For simplicity, these tests will use the admin token, assuming it has sufficient permissions.
    # A more complete test suite would involve creating a citizen user and logging in as them.

    def test_01_get_my_violations(self):
        name = "Get My Violations (Citizen)"
        url = f"{BASE_URL}/citizen/my-violations"
        try:
            response = requests.get(url, headers=get_headers(with_auth=True))
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

    def test_02_get_my_vehicles(self):
        name = "Get My Vehicles (Citizen)"
        url = f"{BASE_URL}/citizen/my-vehicles"
        try:
            response = requests.get(url, headers=get_headers(with_auth=True))
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

    def test_03_get_citizen_dashboard_stats(self):
        name = "Get Citizen Dashboard Stats"
        url = f"{BASE_URL}/citizen/dashboard/stats"
        try:
            response = requests.get(url, headers=get_headers(with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("total_violations" in response_data)
            self.assertTrue("total_fines" in response_data)
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

    def test_04_get_personal_info(self):
        name = "Get Personal Info"
        url = f"{BASE_URL}/citizen/personal-info"
        try:
            response = requests.get(url, headers=get_headers(with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("fullName" in response_data)
            self.assertTrue("email" in response_data)
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

    def test_05_create_vehicle_citizen(self):
        name = "Create Vehicle (Citizen)"
        suffix = generate_random_5_digit_string()
        license_plate = f"29B-{suffix}"
        url = f"{BASE_URL}/vehicles/"
        payload = {
            "license_plate": license_plate,
            "vehicle_type": "motorcycle",
            "vehicle_color": "black",
            "vehicle_brand": "Yamaha",
            "owner_name": "Nguyen Van B",
            "owner_identification": f"ID-{suffix}",
        }
        try:
            response = requests.post(
                url, headers=get_headers(with_auth=True), json=payload
            )
            self.assertEqual(
                response.status_code, 201, f"Expected 201, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(response_data.get("license_plate"), license_plate)
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

    def test_06_register_vehicle_citizen(self):
        name = "Register Vehicle (Citizen)"
        # Generate unique 5-digit suffix from current timestamp
        suffix = str(int(datetime.now().timestamp() * 1000000) % 100000).zfill(5)
        license_plate = f"51F-{suffix}"
        url = f"{BASE_URL}/citizen/vehicles"
        payload = {
            "license_plate": license_plate,
            "vehicle_type": "motorcycle",
            "vehicle_color": "red",
            "vehicle_brand": "Honda",
            "owner_name": "Test User",
            "owner_identification": "ID-TEST",
        }
        try:
            response = requests.post(
                url, headers=get_headers(with_auth=True), json=payload
            )
            self.assertEqual(
                response.status_code, 201, f"Expected 201, got {response.status_code}"
            )
            response_data = response.json()
            self.assertEqual(response_data.get("license_plate"), license_plate)
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
                url, headers=get_headers(with_auth=True), json=payload
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
                url, headers=get_headers(with_auth=True), params=params
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
            response = requests.get(url, headers=get_headers(with_auth=True))
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
            response = requests.get(url, headers=get_headers(with_auth=True))
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
                url, headers=get_headers(with_auth=True), params=params
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
                url, headers=get_headers(with_auth=True), params=params
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
                url, headers=get_headers(with_auth=True), json=payload
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
                url, headers=get_headers(with_auth=True), params=params
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
            response = requests.get(url, headers=get_headers(with_auth=True))
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


class TestPayments(unittest.TestCase):
    def test_01_deposit_to_wallet(self):
        name = "Deposit to Wallet"
        url = f"{BASE_URL}/payments/wallet/deposit"
        params = {"amount": 500000, "payment_method": "bank_transfer"}
        try:
            response = requests.post(
                url, headers=get_headers(with_auth=True), params=params
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
            response = requests.get(url, headers=get_headers(with_auth=True))
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
            response = requests.get(url, headers=get_headers(with_auth=True))
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
                url, headers=get_headers(with_auth=True), params=params
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


class TestNotifications(unittest.TestCase):
    def test_01_get_all_notifications(self):
        name = "Get All Notifications"
        url = f"{BASE_URL}/notifications/"
        params = {"skip": 0, "limit": 10}
        try:
            response = requests.get(
                url, headers=get_headers(with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["notifications"]
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

    def test_02_get_unread_notifications(self):
        name = "Get Unread Notifications"
        url = f"{BASE_URL}/notifications/"
        params = {"unread_only": True}
        try:
            response = requests.get(
                url, headers=get_headers(with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["notifications"]
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            for notification in response_data:
                self.assertFalse(
                    notification.get("read"), "Notification is marked as read"
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

    def test_03_get_unread_count(self):
        name = "Get Unread Count"
        url = f"{BASE_URL}/notifications/unread-count"
        try:
            response = requests.get(url, headers=get_headers(with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("unread_count" in response_data)
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

    def test_04_mark_all_as_read(self):
        name = "Mark All as Read"
        url = f"{BASE_URL}/notifications/mark-all-read"
        try:
            response = requests.post(url, headers=get_headers(with_auth=True))
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue("message" in response_data)  # Assuming a success message
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


class TestActivities(unittest.TestCase):
    def test_01_get_recent_activities(self):
        name = "Get Recent Activities"
        url = f"{BASE_URL}/activities/recent"
        params = {"limit": 10}
        try:
            response = requests.get(
                url, headers=get_headers(with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            self.assertTrue(
                len(response_data) <= 10, "More than limit recent activities returned"
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

    def test_02_get_recent_activities_limited(self):
        name = "Get Recent Activities (limited to 5)"
        url = f"{BASE_URL}/activities/recent"
        params = {"limit": 5}
        try:
            response = requests.get(
                url, headers=get_headers(with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            self.assertTrue(
                len(response_data) <= 5, "More than 5 recent activities returned"
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


class TestStatistics(unittest.TestCase):
    def test_01_get_statistics_7_days(self):
        name = "Get Statistics (7 days)"
        url = f"{BASE_URL}/statistics"
        params = {"date_range": "7days"}
        try:
            response = requests.get(
                url, headers=get_headers(with_auth=True), params=params
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
                url, headers=get_headers(with_auth=True), params=params
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
                url, headers=get_headers(with_auth=True), params=params
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
                url, headers=get_headers(with_auth=True), params=params
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


class TestCameraVideos(unittest.TestCase):
    def test_01_get_camera_videos(self):
        name = "Get Camera Videos"
        # Use the camera_id created in TestCameras
        cam_id = test_data.get("cam_id")
        if not cam_id:
            self.skipTest("Camera ID not created in previous step.")
            return

        url = f"{BASE_URL}/cameras/{cam_id}/videos"
        params = {"skip": 0, "limit": 10}
        try:
            response = requests.get(
                url, headers=get_headers(with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["videos"]
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

    def test_02_filter_videos_with_violations(self):
        name = "Filter Videos with Violations"
        cam_id = test_data.get("cam_id")
        if not cam_id:
            self.skipTest("Camera ID not created in previous step.")
            return

        url = f"{BASE_URL}/cameras/{cam_id}/videos"
        params = {"has_violations": True}
        try:
            response = requests.get(
                url, headers=get_headers(with_auth=True), params=params
            )
            self.assertEqual(
                response.status_code, 200, f"Expected 200, got {response.status_code}"
            )
            response_data = response.json()["videos"]
            self.assertTrue(
                isinstance(response_data, list), "Response should be a list"
            )
            # It's hard to assert 'has_violations' without knowing the data structure of videos.
            # We assume if the endpoint works and returns data, it's a pass for now.
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


# --- Test Runner and Reporting ---
class TestSuiteRunner:
    def __init__(self):
        self.test_classes = [
            TestAuthentication,
            TestUserManagement,
            TestCameras,
            TestViolationRules,
            TestVehicles,
            TestDrivingLicenses,
            TestViolations,
            TestOfficerOperations,
            TestCitizenPortal,
            TestComplaints,
            TestDenunciations,
            TestPayments,
            TestNotifications,
            TestActivities,
            TestStatistics,
            TestCameraVideos,
        ]
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.skipped_tests = 0
        self.test_results = []

    def run_tests(self):
        # We use a TextTestRunner but suppress its standard output to keep our console clean
        runner = unittest.TextTestRunner(stream=open(os.devnull, "w", encoding="utf-8"))

        for test_class in self.test_classes:
            # Load tests specifically for this class into a flat suite
            suite = unittest.TestLoader().loadTestsFromTestCase(test_class)

            # Run the suite
            result = runner.run(suite)

            # Iterate through the specific test cases in this suite to determine status
            for test in suite:
                test_name = (
                    test._testMethodName if hasattr(test, "_testMethodName") else None
                )
                if test_name is None:
                    continue
                class_name = test.__class__.__name__
                full_test_name = f"{class_name}.{test_name}"

                status = "PASS"
                details = ""

                # Check Errors (Exceptions)
                for error in result.errors:
                    if error[0] == test:
                        status = "FAIL"
                        details = str(error[1])
                        break

                # Check Failures (AssertionErrors)
                if status == "PASS":
                    for failure in result.failures:
                        if failure[0] == test:
                            status = "FAIL"
                            details = str(failure[1])
                            break

                # Check Skipped
                if status == "PASS":
                    for skipped in result.skipped:
                        if skipped[0] == test:
                            status = "SKIPPED"
                            details = str(skipped[1])
                            break

                # Update stats
                if status == "PASS":
                    self.passed_tests += 1
                elif status == "FAIL":
                    self.failed_tests += 1
                elif status == "SKIPPED":
                    self.skipped_tests += 1

                self.test_results.append(
                    {"name": full_test_name, "status": status, "details": details}
                )
                self.total_tests += 1

        self.generate_report()

    def generate_report(self):
        with open(REPORT_FILE, "w") as f:
            f.write(
                "======================================================================\n"
            )
            f.write(
                "                      COMPREHENSIVE API TEST REPORT                   \n"
            )
            f.write(
                "======================================================================\n"
            )
            f.write(
                f"Test Run Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            )
            f.write(f"Base URL: {BASE_URL}\n")
            f.write(f"Log File: {LOG_FILE}\n")
            f.write(
                "----------------------------------------------------------------------\n"
            )
            f.write(
                "                      TEST EXECUTION SUMMARY                          \n"
            )
            f.write(
                "----------------------------------------------------------------------\n"
            )
            f.write(f"Total Tests Run: {self.total_tests}\n")
            f.write(f"Passed: {self.passed_tests}\n")
            f.write(f"Failed: {self.failed_tests}\n")
            f.write(f"Skipped: {self.skipped_tests}\n")
            f.write(
                "----------------------------------------------------------------------\n"
            )
            f.write(
                "                      DETAILED TEST RESULTS                           \n"
            )
            f.write(
                "----------------------------------------------------------------------\n"
            )
            for result in self.test_results:
                f.write(f"[{result['status']}] {result['name']}\n")
                if result["details"]:
                    # Truncate really long error messages for readability
                    clean_details = result["details"].strip().split("\n")
                    f.write(
                        f"    Details: {clean_details[-1] if clean_details else result['details']}\n"
                    )
            f.write(
                "======================================================================\n"
            )
            f.write(
                "                           END OF REPORT                              \n"
            )
            f.write(
                "======================================================================\n"
            )

        print(f"\nTest run completed. Summary saved to {REPORT_FILE}")
        print(f"Detailed logs saved to {LOG_FILE}")


if __name__ == "__main__":
    # Ensure admin user is registered before running other tests
    print("Running initial setup...")
    try:
        response = requests.post(
            f"{BASE_URL}/register",
            headers={"Content-Type": "application/json"},
            json={
                "username": test_data["admin_user"],
                "email": test_data["admin_email"],
                "password": test_data["admin_pass"],
                "full_name": "System Admin",
                "role": "admin",
                "phone_number": "0900000001",
            },
        )
        if response.status_code not in [200, 201]:
            print(
                f"Admin registration failed (or user already exists): {response.status_code} - {response.text}"
            )
            # Proceeding anyway, assuming user might exist and login will work.
    except Exception as e:
        print(f"Error during initial admin registration setup: {e}")

    print("Starting API test suite...")
    runner = TestSuiteRunner()
    runner.run_tests()
