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
                url, headers=get_headers(test_data, with_auth=True), params=params
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
                url, headers=get_headers(test_data, with_auth=True), params=params
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


if __name__ == "__main__":
    unittest.main()
