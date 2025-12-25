import io
import logging
import sys
from datetime import datetime

import coloredlogs
import pytest

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

coloredlogs.install(
    level="INFO",
    fmt="%(asctime)s - %(levelname)s - %(message)s",
    level_styles={"info": {"color": "green"}, "error": {"color": "red"}},
)


# --- Test Data Storage ---
# Module-level test data for unittest compatibility
_test_data_store = {
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


def test_data():
    """Shared test data storage across all tests - regular function for unittest compatibility"""
    return _test_data_store


@pytest.fixture(scope="session")
def test_data_fixture():
    """Pytest fixture wrapper for test_data - use this in pytest tests"""
    return _test_data_store


# --- Helper Functions ---
def get_headers(test_data=None, with_auth=False):
    """Generate request headers with optional authentication"""
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if with_auth and test_data and test_data.get("access_token"):
        headers["Authorization"] = f"Bearer {test_data['access_token']}"
    return headers


def generate_random_suffix():
    """Generate a random suffix based on current timestamp"""
    return datetime.now().strftime("%Y%m%d%H%M%S%f")


five_digit_string = datetime.now().strftime("%f")[-5:]


def generate_random_5_digit_string():
    """Generate a random 5-digit string"""
    return five_digit_string


def log_test_case(name, status, details=""):
    """Log test case results"""
    if status == "PASS":
        logging.info(f"PASS: {name}")
    else:
        logging.error(f"FAIL: {name} - {details}")
    return status == "PASS"


# --- Pytest Hooks for Test Ordering ---
def pytest_collection_modifyitems(items):
    """
    Pytest hook to reorder tests in a specific sequence.
    This ensures tests run in the correct dependency order.
    """
    # Define the desired test file order
    test_file_order = [
        "test_auth_endpoints.py",
        "test_user_management.py",
        "test_cameras.py",
        "test_violation_rules.py",
        "test_vehicles.py",
        "test_driving_licenses.py",
        "test_violations.py",
        "test_officer_operations.py",
        "test_citizen_portal.py",
        "test_complaints.py",
        "test_denunciations.py",
        "test_payments.py",
        "test_notifications.py",
        "test_activities.py",
        "test_statistics.py",
        "test_camera_videos.py",
    ]

    def get_order_key(item):
        """Generate a sort key for test items based on file and method order"""
        # Get the file name from the test item
        file_name = item.location[0].split("/")[-1].split("\\")[-1]

        # Get the order index for this file (default to 999 if not in list)
        try:
            file_order = test_file_order.index(file_name)
        except ValueError:
            file_order = 999

        # Get the test method name to maintain order within the file
        test_name = item.name

        # Extract test number if it follows test_XX_ pattern
        if hasattr(item, "function"):
            func_name = item.function.__name__
            if func_name.startswith("test_") and len(func_name) > 7:
                # Try to extract number from test_01_, test_02_, etc.
                try:
                    test_num = int(func_name[5:7])
                except (ValueError, IndexError):
                    test_num = 999
            else:
                test_num = 999
        else:
            test_num = 999

        # Return tuple for sorting: (file_order, test_number, test_name)
        return (file_order, test_num, test_name)

    # Sort the test items
    items.sort(key=get_order_key)

    # Log the test execution order
    logging.info("=" * 80)
    logging.info("Pytest Test Execution Order:")
    logging.info("=" * 80)
    for idx, item in enumerate(items, 1):
        logging.info(f"{idx}. {item.nodeid}")
    logging.info("=" * 80)


# Export commonly used items
__all__ = [
    "BASE_URL",
    "LOG_FILE",
    "REPORT_FILE",
    "test_data",
    "test_data_fixture",
    "get_headers",
    "generate_random_suffix",
    "generate_random_5_digit_string",
    "log_test_case",
    "pytest_collection_modifyitems",
]
