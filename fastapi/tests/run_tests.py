"""
Test Suite Runner with Custom Order
====================================
This script runs all test classes in a specific order to handle dependencies
between tests (e.g., authentication must run before other tests).
"""

import logging
import sys
import unittest
from datetime import datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from tests.api.test_activities import TestActivities
from tests.api.test_auth_endpoints import TestAuthentication
from tests.api.test_camera_videos import TestCameraVideos
from tests.api.test_cameras import TestCameras
from tests.api.test_citizen_portal import TestCitizenPortal
from tests.api.test_complaints import TestComplaints
from tests.api.test_denunciations import TestDenunciations
from tests.api.test_driving_licenses import TestDrivingLicenses
from tests.api.test_notifications import TestNotifications
from tests.api.test_officer_operations import TestOfficerOperations
from tests.api.test_payments import TestPayments
from tests.api.test_statistics import TestStatistics
from tests.api.test_user_management import TestUserManagement
from tests.api.test_vehicles import TestVehicles
from tests.api.test_violation_rules import TestViolationRules
from tests.api.test_violations import TestViolations


class TestSuiteRunner:
    """Custom test suite runner that executes tests in a specific order"""

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
        self.setup_logging()

    def setup_logging(self):
        """Configure logging for test execution"""
        log_format = "%(asctime)s - %(levelname)s - %(message)s"
        logging.basicConfig(
            level=logging.INFO,
            format=log_format,
            handlers=[
                logging.FileHandler(
                    f"test_run_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log",
                    mode="w",
                    encoding="utf-8",
                ),
                logging.StreamHandler(),
            ],
        )

    def create_suite(self):
        """Create a test suite with tests in the specified order"""
        suite = unittest.TestSuite()

        for test_class in self.test_classes:
            # Load all tests from each test class
            tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
            suite.addTests(tests)
            logging.info(f"Added test class: {test_class.__name__}")

        return suite

    def run(self, verbosity=2):
        """Run the test suite and return results"""
        logging.info("=" * 80)
        logging.info("Starting Test Suite Execution")
        logging.info(f"Total test classes: {len(self.test_classes)}")
        logging.info("=" * 80)

        suite = self.create_suite()
        runner = unittest.TextTestRunner(verbosity=verbosity)

        start_time = datetime.now()
        result = runner.run(suite)
        end_time = datetime.now()

        duration = (end_time - start_time).total_seconds()

        # Print summary
        logging.info("=" * 80)
        logging.info("Test Suite Execution Complete")
        logging.info(f"Duration: {duration:.2f} seconds")
        logging.info(f"Tests run: {result.testsRun}")
        logging.info(f"Failures: {len(result.failures)}")
        logging.info(f"Errors: {len(result.errors)}")
        logging.info(f"Skipped: {len(result.skipped)}")
        logging.info("=" * 80)

        return result


def main():
    """Main entry point for running tests"""
    runner = TestSuiteRunner()
    result = runner.run(verbosity=2)

    # Exit with appropriate code
    if result.wasSuccessful():
        logging.info("✓ All tests passed!")
        sys.exit(0)
    else:
        logging.error("✗ Some tests failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
