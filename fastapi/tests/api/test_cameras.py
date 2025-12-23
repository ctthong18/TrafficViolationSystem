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
                url, headers=get_headers(test_data, with_auth=True), json=payload
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

    def test_03_get_camera_detail(self):
        name = "Get Camera Detail"
        url = f"{BASE_URL}/cameras/{test_data['cam_id']}"
        try:
            response = requests.get(url, headers=get_headers(test_data, with_auth=True))
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
                url, headers=get_headers(test_data, with_auth=True), params=params
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
                url, headers=get_headers(test_data, with_auth=True), params=params
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
                url, headers=get_headers(test_data, with_auth=True), json=payload
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


if __name__ == "__main__":
    unittest.main()
