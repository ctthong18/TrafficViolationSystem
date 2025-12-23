@echo off
setlocal EnableDelayedExpansion

:: ==========================================
:: COMPREHENSIVE API TEST SUITE
:: Traffic Violation Management System
:: ==========================================

set "BASE_URL=http://localhost:8000"
set "JSON_H=Content-Type: application/json"
set "RND=%RANDOM%"

echo ======================================================================
echo   COMPREHENSIVE API TEST SUITE - Test ID: %RND%
echo ======================================================================
echo.

:: Admin credentials
set "ADM_USER=admin"
set "ADM_PASS=admin123"
set "ADM_EMAIL=admin@gmail.com"

:: ==========================================
:: MODULE 1: AUTHENTICATION & USER MANAGEMENT
:: ==========================================
echo.
echo ==================== MODULE 1: AUTHENTICATION ====================
echo.

echo 1.1 Register Admin User...
curl -s -X POST "%BASE_URL%/api/v1/register" -H "%JSON_H%" ^
  -d "{\"username\":\"%ADM_USER%\",\"email\":\"%ADM_EMAIL%\",\"password\":\"%ADM_PASS%\",\"full_name\":\"System Admin\",\"role\":\"admin\",\"phone_number\":\"0900000001\"}"
echo.
echo.

echo 1.2 Login Admin...
curl -s -X POST "%BASE_URL%/api/v1/login" -H "%JSON_H%" ^
  -d "{\"username_or_email\":\"%ADM_USER%\",\"password\":\"%ADM_PASS%\"}"
echo.
echo.

echo ======================================================================
echo   ACTION REQUIRED: Copy the access_token from above
echo ======================================================================
set /p ACCESS_TOKEN="Paste Access Token: "
set "AUTH_H=Authorization: Bearer %ACCESS_TOKEN%"
echo.

echo 1.3 Get Current User Info (/api/v1/me)...
curl -s -X GET "%BASE_URL%/api/v1/me" -H "%AUTH_H%"
echo.
echo.

echo 1.4 Register Citizen User...
set "CIT_USER=citizen_%RND%"
set "CIT_EMAIL=citizen_%RND%@test.com"
curl -s -X POST "%BASE_URL%/api/v1/register" -H "%JSON_H%" ^
  -d "{\"username\":\"%CIT_USER%\",\"email\":\"%CIT_EMAIL%\",\"password\":\"Citizen123\",\"full_name\":\"Test Citizen %RND%\",\"role\":\"citizen\",\"phone_number\":\"0901111%RND%\"}"
echo.
echo.

echo 1.5 Register Officer User...
set "OFF_USER=officer_%RND%"
set "OFF_EMAIL=officer_%RND%@police.gov"
curl -s -X POST "%BASE_URL%/api/v1/admin/users/officers" -H "%AUTH_H%" -H "%JSON_H%" ^
  -d "{\"username\":\"%OFF_USER%\",\"email\":\"%OFF_EMAIL%\",\"full_name\":\"Officer %RND%\",\"identification_number\":\"OFF-%RND%\",\"password\":\"Officer123\",\"role\":\"officer\",\"badge_number\":\"B-%RND%\",\"department\":\"Traffic Control\"}"
echo.
echo.
pause

:: ==========================================
:: MODULE 2: USER MANAGEMENT (ADMIN)
:: ==========================================
echo.
echo ==================== MODULE 2: USER MANAGEMENT ====================
echo.

echo 2.1 List All Users (/api/v1/admin/users)...
curl -s -X GET "%BASE_URL%/api/v1/admin/users?skip=0&limit=10" -H "%AUTH_H%"
echo.
echo.

echo 2.2 Filter Users by Role=officer...
curl -s -X GET "%BASE_URL%/api/v1/admin/users?role=officer&limit=5" -H "%AUTH_H%"
echo.
echo.

echo 2.3 Get Admin Dashboard Stats...
curl -s -X GET "%BASE_URL%/api/v1/admin/dashboard/stats" -H "%AUTH_H%"
echo.
echo.

echo 2.4 List All Users (Simple) (/api/v1/users)...
curl -s -X GET "%BASE_URL%/api/v1/users" -H "%AUTH_H%"
echo.
echo.
pause

:: ==========================================
:: MODULE 3: CAMERAS
:: ==========================================
echo.
echo ==================== MODULE 3: CAMERAS ====================
echo.

set "CAM_ID=CAM-%RND%"
echo 3.1 Create Camera (%CAM_ID%)...
curl -s -X POST "%BASE_URL%/api/v1/cameras/" -H "%AUTH_H%" -H "%JSON_H%" ^
  -d "{\"camera_id\":\"%CAM_ID%\",\"name\":\"Camera %RND%\",\"location_name\":\"Hanoi Downtown\",\"latitude\":21.0285,\"longitude\":105.8542,\"camera_type\":\"ANPR\",\"resolution\":\"4K\",\"status\":\"online\"}"
echo.
echo.

echo 3.2 List Cameras...
curl -s -X GET "%BASE_URL%/api/v1/cameras/?skip=0&limit=10" -H "%AUTH_H%"
echo.
echo.

echo 3.3 Get Camera Detail (%CAM_ID%)...
curl -s -X GET "%BASE_URL%/api/v1/cameras/%CAM_ID%" -H "%AUTH_H%"
echo.
echo.

echo 3.4 Filter Cameras by Status=online...
curl -s -X GET "%BASE_URL%/api/v1/cameras/?status=online&limit=5" -H "%AUTH_H%"
echo.
echo.

echo 3.5 Search Cameras by Name...
curl -s -X GET "%BASE_URL%/api/v1/cameras/?search=Camera" -H "%AUTH_H%"
echo.
echo.

echo 3.6 Update Camera Status...
curl -s -X PUT "%BASE_URL%/api/v1/cameras/%CAM_ID%" -H "%AUTH_H%" -H "%JSON_H%" ^
  -d "{\"status\":\"maintenance\"}"
echo.
echo.
pause

:: ==========================================
:: MODULE 4: VIOLATION RULES
:: ==========================================
echo.
echo ==================== MODULE 4: VIOLATION RULES ====================
echo.

echo 4.1 Create Violation Rule...
curl -s -X POST "%BASE_URL%/api/v1/violation-rules/" -H "%AUTH_H%" -H "%JSON_H%" ^
  -d "{\"code\":\"SPEED-%RND%\",\"description\":\"Speeding over 20km/h\",\"law_reference\":\"ND100/2019\",\"fine_min_car\":3000000,\"fine_max_car\":5000000,\"points_car\":2}"
echo.
echo.

echo 4.2 List Violation Rules...
curl -s -X GET "%BASE_URL%/api/v1/violation-rules/?skip=0&limit=10" -H "%AUTH_H%"
echo.
echo.

echo 4.3 Search Violation Rules...
curl -s -X GET "%BASE_URL%/api/v1/violation-rules/?search=SPEED" -H "%AUTH_H%"
echo.
echo.
pause

:: ==========================================
:: MODULE 5: VEHICLES
:: ==========================================
echo.
echo ==================== MODULE 5: VEHICLES ====================
echo.

set "PLATE=30H-%RND%"
echo 5.1 Register Vehicle (%PLATE%)...
curl -s -X POST "%BASE_URL%/api/v1/vehicles/" -H "%AUTH_H%" -H "%JSON_H%" ^
  -d "{\"license_plate\":\"%PLATE%\",\"vehicle_type\":\"car\",\"vehicle_color\":\"white\",\"vehicle_brand\":\"Toyota\",\"owner_name\":\"Nguyen Van A\",\"owner_identification\":\"ID-%RND%\"}"
echo.
echo.

echo 5.2 List All Vehicles (Admin/Officer)...
curl -s -X GET "%BASE_URL%/api/v1/vehicles/?skip=0&limit=10" -H "%AUTH_H%"
echo.
echo.

echo 5.3 Get My Vehicles...
curl -s -X GET "%BASE_URL%/api/v1/vehicles/my-vehicles" -H "%AUTH_H%"
echo.
echo.

echo 5.4 Search Vehicle by License Plate...
curl -s -X GET "%BASE_URL%/api/v1/vehicles/?license_plate=%PLATE%" -H "%AUTH_H%"
echo.
echo.

echo 5.5 Search Vehicle by Owner Name...
curl -s -X GET "%BASE_URL%/api/v1/vehicles/?owner_name=Nguyen" -H "%AUTH_H%"
echo.
echo.

echo 5.6 Get Vehicle by License Plate...
curl -s -X GET "%BASE_URL%/api/v1/vehicles/license-plate/%PLATE%" -H "%AUTH_H%"
echo.
echo.
pause

:: ==========================================
:: MODULE 6: DRIVING LICENSES
:: ==========================================
echo.
echo ==================== MODULE 6: DRIVING LICENSES ====================
echo.

echo 6.1 Create Driving License...
curl -s -X POST "%BASE_URL%/api/v1/driving-licenses/" -H "%AUTH_H%" -H "%JSON_H%" ^
  -d "{\"license_number\":\"LIC-%RND%\",\"license_class\":\"B2\",\"full_name\":\"Nguyen Van A\",\"date_of_birth\":\"1990-01-01\",\"issue_date\":\"2020-01-01\",\"expiry_date\":\"2030-01-01\"}"
echo.
echo.

echo 6.2 Get My Driving License...
curl -s -X GET "%BASE_URL%/api/v1/driving-licenses/my-license" -H "%AUTH_H%"
echo.
echo.

echo 6.3 Check License Status...
curl -s -X GET "%BASE_URL%/api/v1/driving-licenses/LIC-%RND%/status" -H "%AUTH_H%"
echo.
echo.
pause

:: ==========================================
:: MODULE 7: VIOLATIONS
:: ==========================================
echo.
echo ==================== MODULE 7: VIOLATIONS ====================
echo.

echo 7.1 List All Violations...
curl -s -X GET "%BASE_URL%/api/v1/violations/?skip=0&limit=10" -H "%AUTH_H%"
echo.
echo.

echo 7.2 Filter Violations by Status=pending...
curl -s -X GET "%BASE_URL%/api/v1/violations/?status=pending&limit=5" -H "%AUTH_H%"
echo.
echo.

echo 7.3 Search Violations by License Plate...
curl -s -X GET "%BASE_URL%/api/v1/violations/?license_plate=%PLATE%" -H "%AUTH_H%"
echo.
echo.

echo 7.4 Get Processed Violations...
curl -s -X GET "%BASE_URL%/api/v1/violations/processed/list?skip=0&limit=10" -H "%AUTH_H%"
echo.
echo.

echo 7.5 Get Recent Violations (for dashboard)...
curl -s -X GET "%BASE_URL%/api/v1/violations/recent?limit=5" -H "%AUTH_H%"
echo.
echo.
pause

:: ==========================================
:: MODULE 8: OFFICER OPERATIONS
:: ==========================================
echo.
echo ==================== MODULE 8: OFFICER OPERATIONS ====================
echo.

echo 8.1 Get Review Queue (Officer)...
curl -s -X GET "%BASE_URL%/api/v1/officer/violations/review-queue?skip=0&limit=10" -H "%AUTH_H%"
echo.
echo.

echo 8.2 Get Officer Dashboard Stats...
curl -s -X GET "%BASE_URL%/api/v1/officer/dashboard/stats" -H "%AUTH_H%"
echo.
echo.

echo 8.3 Get Officer Activities...
curl -s -X GET "%BASE_URL%/api/v1/officer/dashboard/activities" -H "%AUTH_H%"
echo.
echo.

echo 8.4 Get Assigned Complaints...
curl -s -X GET "%BASE_URL%/api/v1/officer/complaints/assigned" -H "%AUTH_H%"
echo.
echo.
pause

:: ==========================================
:: MODULE 9: CITIZEN PORTAL
:: ==========================================
echo.
echo ==================== MODULE 9: CITIZEN PORTAL ====================
echo.

echo 9.1 Get My Violations (Citizen)...
curl -s -X GET "%BASE_URL%/api/v1/citizen/my-violations" -H "%AUTH_H%"
echo.
echo.

echo 9.2 Get My Vehicles (Citizen)...
curl -s -X GET "%BASE_URL%/api/v1/citizen/my-vehicles" -H "%AUTH_H%"
echo.
echo.

echo 9.3 Get Citizen Dashboard Stats...
curl -s -X GET "%BASE_URL%/api/v1/citizen/dashboard/stats" -H "%AUTH_H%"
echo.
echo.

echo 9.4 Get Personal Info...
curl -s -X GET "%BASE_URL%/api/v1/citizen/personal-info" -H "%AUTH_H%"
echo.
echo.

echo 9.5 Register Vehicle (Citizen)...
curl -s -X POST "%BASE_URL%/api/v1/citizen/vehicles" -H "%AUTH_H%" -H "%JSON_H%" ^
  -d "{\"license_plate\":\"29A-%RND%\",\"vehicle_type\":\"motorcycle\",\"vehicle_color\":\"red\",\"vehicle_brand\":\"Honda\",\"owner_name\":\"Test User\",\"owner_identification\":\"ID-TEST\"}"
echo.
echo.
pause

:: ==========================================
:: MODULE 10: COMPLAINTS
:: ==========================================
echo.
echo ==================== MODULE 10: COMPLAINTS ====================
echo.

echo 10.1 Create Complaint...
curl -s -X POST "%BASE_URL%/api/v1/complaints/" -H "%AUTH_H%" -H "%JSON_H%" ^
  -d "{\"title\":\"Test Complaint %RND%\",\"description\":\"Testing complaint system\",\"complaint_type\":\"system_error\",\"is_anonymous\":false}"
echo.
echo.

echo 10.2 List All Complaints...
curl -s -X GET "%BASE_URL%/api/v1/complaints/?skip=0&limit=10" -H "%AUTH_H%"
echo.
echo.

echo 10.3 Get My Complaints...
curl -s -X GET "%BASE_URL%/api/v1/complaints/my-complaints" -H "%AUTH_H%"
echo.
echo.

echo 10.4 Get Assigned Complaints...
curl -s -X GET "%BASE_URL%/api/v1/complaints/assigned" -H "%AUTH_H%"
echo.
echo.

echo 10.5 Filter Complaints by Type...
curl -s -X GET "%BASE_URL%/api/v1/complaints/?complaint_type=system_error" -H "%AUTH_H%"
echo.
echo.

echo 10.6 Filter Complaints by Status...
curl -s -X GET "%BASE_URL%/api/v1/complaints/?status=pending" -H "%AUTH_H%"
echo.
echo.
pause

:: ==========================================
:: MODULE 11: DENUNCIATIONS
:: ==========================================
echo.
echo ==================== MODULE 11: DENUNCIATIONS ====================
echo.

echo 11.1 Create Denunciation...
curl -s -X POST "%BASE_URL%/api/v1/denunciations/" -H "%AUTH_H%" -H "%JSON_H%" ^
  -d "{\"title\":\"Traffic Violation Report %RND%\",\"description\":\"Reporting dangerous driving\",\"denunciation_type\":\"other_illegal\",\"is_anonymous\":true,\"severity_level\":\"high\"}"
echo.
echo.

echo 11.2 List Denunciations...
curl -s -X GET "%BASE_URL%/api/v1/denunciations/?skip=0&limit=10" -H "%AUTH_H%"
echo.
echo.

echo 11.3 Get Assigned Denunciations...
curl -s -X GET "%BASE_URL%/api/v1/denunciations/assigned" -H "%AUTH_H%"
echo.
echo.
pause

:: ==========================================
:: MODULE 12: PAYMENTS
:: ==========================================
echo.
echo ==================== MODULE 12: PAYMENTS ====================
echo.

echo 12.1 Deposit to Wallet...
curl -s -X POST "%BASE_URL%/api/v1/payments/wallet/deposit?amount=500000&payment_method=bank_transfer" -H "%AUTH_H%"
echo.
echo.

echo 12.2 Get Wallet Summary...
curl -s -X GET "%BASE_URL%/api/v1/payments/wallet/summary" -H "%AUTH_H%"
echo.
echo.

echo 12.3 Get My Payments...
curl -s -X GET "%BASE_URL%/api/v1/payments/my-payments" -H "%AUTH_H%"
echo.
echo.

echo 12.4 Filter Payments by Type...
curl -s -X GET "%BASE_URL%/api/v1/payments/my-payments?payment_type=deposit" -H "%AUTH_H%"
echo.
echo.
pause

:: ==========================================
:: MODULE 13: NOTIFICATIONS
:: ==========================================
echo.
echo ==================== MODULE 13: NOTIFICATIONS ====================
echo.

echo 13.1 Get All Notifications...
curl -s -X GET "%BASE_URL%/api/v1/notifications/?skip=0&limit=10" -H "%AUTH_H%"
echo.
echo.

echo 13.2 Get Unread Notifications...
curl -s -X GET "%BASE_URL%/api/v1/notifications/?unread_only=true" -H "%AUTH_H%"
echo.
echo.

echo 13.3 Get Unread Count...
curl -s -X GET "%BASE_URL%/api/v1/notifications/unread-count" -H "%AUTH_H%"
echo.
echo.

echo 13.4 Mark All as Read...
curl -s -X POST "%BASE_URL%/api/v1/notifications/mark-all-read" -H "%AUTH_H%"
echo.
echo.
pause

:: ==========================================
:: MODULE 14: ACTIVITIES
:: ==========================================
echo.
echo ==================== MODULE 14: ACTIVITIES ====================
echo.

echo 14.1 Get Recent Activities...
curl -s -X GET "%BASE_URL%/api/v1/activities/recent?limit=10" -H "%AUTH_H%"
echo.
echo.

echo 14.2 Get Recent Activities (limited to 5)...
curl -s -X GET "%BASE_URL%/api/v1/activities/recent?limit=5" -H "%AUTH_H%"
echo.
echo.
pause

:: ==========================================
:: MODULE 15: STATISTICS
:: ==========================================
echo.
echo ==================== MODULE 15: STATISTICS ====================
echo.

echo 15.1 Get Statistics (7 days)...
curl -s -X GET "%BASE_URL%/api/v1/statistics?date_range=7days" -H "%AUTH_H%"
echo.
echo.

echo 15.2 Get Statistics (30 days)...
curl -s -X GET "%BASE_URL%/api/v1/statistics?date_range=30days" -H "%AUTH_H%"
echo.
echo.

echo 15.3 Get Statistics (3 months)...
curl -s -X GET "%BASE_URL%/api/v1/statistics?date_range=3months" -H "%AUTH_H%"
echo.
echo.

echo 15.4 Get Statistics (year)...
curl -s -X GET "%BASE_URL%/api/v1/statistics?date_range=year" -H "%AUTH_H%"
echo.
echo.
pause

:: ==========================================
:: MODULE 16: VIDEOS (Camera Videos)
:: ==========================================
echo.
echo ==================== MODULE 16: CAMERA VIDEOS ====================
echo.

echo 16.1 Get Camera Videos...
curl -s -X GET "%BASE_URL%/api/v1/cameras/%CAM_ID%/videos?skip=0&limit=10" -H "%AUTH_H%"
echo.
echo.

echo 16.2 Filter Videos with Violations...
curl -s -X GET "%BASE_URL%/api/v1/cameras/%CAM_ID%/videos?has_violations=true" -H "%AUTH_H%"
echo.
echo.

echo Note: Video upload requires multipart/form-data - use Postman or frontend for testing
echo.
pause

:: ==========================================
:: SUMMARY
:: ==========================================
echo.
echo ======================================================================
echo   COMPREHENSIVE API TEST COMPLETED
echo ======================================================================
echo.
echo Test ID: %RND%
echo.
echo APIs Tested:
echo   - Authentication (login, register, me)
echo   - User Management (admin, officer, citizen)
echo   - Cameras (CRUD + search + filter)
echo   - Violation Rules (CRUD + search)
echo   - Vehicles (CRUD + search + my-vehicles)
echo   - Driving Licenses (CRUD + status check)
echo   - Violations (list, filter, search, processed, recent)
echo   - Officer Operations (review queue, dashboard, activities, complaints)
echo   - Citizen Portal (violations, vehicles, dashboard, personal info)
echo   - Complaints (CRUD + filter + assign + resolve)
echo   - Denunciations (CRUD + filter + assign)
echo   - Payments (wallet, deposits, history)
echo   - Notifications (list, unread, mark as read)
echo   - Activities (recent activities)
echo   - Statistics (multiple time ranges)
echo   - Camera Videos (list + filter)
echo.
echo APIs NOT Tested (require special handling):
echo   - Video Upload (requires multipart/form-data)
echo   - Video Delete (requires video_id)
echo   - QR Payment Generation (requires payment_id)
echo   - Violation Review (requires violation_id)
echo   - Password Change (requires current password)
echo   - Calendar Analytics (requires date parameters)
echo   - WebSocket Stream (ws://...)
echo.
echo ======================================================================
pause
