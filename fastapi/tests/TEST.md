# Traffic Violation System - API Tests

This directory contains the API integration tests for the Traffic Violation System.

## Test Structure

The tests have been organized into separate modules for better maintainability:

```
tests/
├── conftest.py                         # Shared configuration, fixtures, and helper functions
├── api/                                # API endpoint tests
│   ├── test_auth_endpoints.py          # Authentication tests
│   ├── test_user_management.py         # User management tests
│   ├── test_cameras.py                 # Camera management tests
│   ├── test_violation_rules.py         # Violation rules tests
│   ├── test_vehicles.py                # Vehicle management tests
│   ├── test_driving_licenses.py        # Driving license tests
│   ├── test_violations.py              # Violation tests
│   ├── test_officer_operations.py      # Officer-specific operations
│   ├── test_citizen_portal.py          # Citizen portal tests
│   ├── test_complaints.py              # Complaint system tests
│   ├── test_denunciations.py           # Denunciation tests
│   ├── test_payments.py                # Payment and wallet tests
│   ├── test_notifications.py           # Notification tests
│   ├── test_activities.py              # Activity tracking tests
│   ├── test_statistics.py              # Statistics endpoint tests
│   └── test_camera_videos.py           # Camera video tests
├── integration/                        # Integration tests (if needed)
└── unit/                               # Unit tests (if needed)
```

## Configuration

### Base URL
The default base URL is set to `http://localhost:8000/api/v1` in `conftest.py`. You can modify this if your API runs on a different port.

### Test Data
Test data is shared across all test files using a session-scoped fixture defined in `conftest.py`. This ensures that data created in one test (e.g., admin user, access token) can be used in subsequent tests.

## Running Tests

### Prerequisites
1. Ensure the FastAPI server is running:
   ```bash
   cd fastapi
   python main.py
   ```

2. Install test dependencies:
   ```bash
   pip install pytest requests coloredlogs
   ```

### Run All Tests
```bash
# Using pytest (recommended)
cd fastapi
pytest tests/api/ -v

# Using unittest
cd fastapi
python -m unittest discover -s tests/api -p "test_*.py" -v
```

### Run Specific Test Module
```bash
# Using pytest
pytest tests/api/test_auth_endpoints.py -v

# Using unittest
python -m unittest tests.api.test_auth_endpoints -v
```

### Run Specific Test Class
```bash
# Using pytest
pytest tests/api/test_auth_endpoints.py::TestAuthentication -v

# Using unittest
python -m unittest tests.api.test_auth_endpoints.TestAuthentication -v
```

### Run Specific Test Method
```bash
# Using pytest
pytest tests/api/test_auth_endpoints.py::TestAuthentication::test_01_register_admin -v

# Using unittest
python -m unittest tests.api.test_auth_endpoints.TestAuthentication.test_01_register_admin -v
```

### Run with Coverage
```bash
pytest tests/api/ --cov=app --cov-report=html
```

## Test Execution Order

**IMPORTANT:** Tests are designed to run in a specific order as they depend on data created in previous tests:

1. **Authentication** - Creates admin user and obtains access token
2. **User Management** - Tests user listing and filtering
3. **Cameras** - Creates and manages camera records
4. **Violation Rules** - Creates violation rule definitions
5. **Vehicles** - Registers vehicles
6. **Driving Licenses** - Creates driving licenses
7. **Violations** - Tests violation management
8. **Officer Operations** - Tests officer-specific endpoints
9. **Citizen Portal** - Tests citizen-specific endpoints
10. **Complaints** - Tests complaint system
11. **Denunciations** - Tests denunciation system
12. **Payments** - Tests payment and wallet functionality
13. **Notifications** - Tests notification system
14. **Activities** - Tests activity tracking
15. **Statistics** - Tests statistics endpoints
16. **Camera Videos** - Tests camera video retrieval

To ensure proper execution order, run all tests together or be aware of dependencies between test modules.

## Shared Test Data

The `test_data` dictionary in `conftest.py` stores shared data across tests:

- `access_token` - Authentication token
- `admin_user`, `admin_pass`, `admin_email` - Admin credentials
- `cit_user`, `cit_email` - Citizen user info
- `off_user`, `off_email` - Officer user info
- `cam_id` - Created camera ID
- `plate` - Vehicle license plate
- `license_number` - Driving license number
- `license_id` - Driving license ID
- `violation_code` - Violation rule code
- `complaint_title` - Complaint title
- `denunciation_title` - Denunciation title

## Helper Functions

Available helper functions from `conftest.py`:

- `get_headers(test_data, with_auth=False)` - Generate HTTP headers with optional authentication
- `generate_random_suffix()` - Generate timestamp-based unique suffix
- `generate_random_5_digit_string()` - Generate 5-digit unique string
- `log_test_case(name, status, details="")` - Log test results

## Logging

Test execution logs are saved to:
- `test_suite.log` - Detailed test execution log
- `test_summary.txt` - Test summary report (if using the old test runner)

## Notes

1. **Test Isolation**: While tests share some data, each test should be as independent as possible
2. **Cleanup**: Consider adding teardown methods to clean up test data after execution
3. **Environment**: These are integration tests that require a running API server
4. **Authentication**: Most tests require authentication. The admin user is created in the first test
5. **Data Persistence**: Tests assume data persists in the database between test runs

## Troubleshooting

### Connection Errors
- Ensure the FastAPI server is running on the correct port
- Check that `BASE_URL` in `conftest.py` matches your server configuration

### Authentication Failures
- Ensure `test_01_register_admin` and `test_02_login_admin` in `test_auth_endpoints.py` run successfully first
- Check that the access token is being stored in `test_data`

### Missing Test Data
- Some tests depend on data created in previous tests
- Run tests in the correct order or run the full test suite

## Migration from Old Test Structure

The tests have been split from a single `test_app.py` file into multiple organized modules. The functionality remains the same, but the structure is more maintainable.

Key changes:
- Shared configuration moved to `conftest.py`
- Each test class now has its own file
- Test data sharing mechanism updated for module-level compatibility
- Helper functions centralized in `conftest.py`
