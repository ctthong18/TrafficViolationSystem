# DrivingLicensesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**checkLicenseStatusApiV1DrivingLicensesLicenseNumberStatusGet**](#checklicensestatusapiv1drivinglicenseslicensenumberstatusget) | **GET** /api/v1/driving-licenses/{license_number}/status | Check License Status|
|[**createDrivingLicenseApiV1DrivingLicensesPost**](#createdrivinglicenseapiv1drivinglicensespost) | **POST** /api/v1/driving-licenses/ | Create Driving License|
|[**deleteDrivingLicenseApiV1DrivingLicensesLicenseIdDelete**](#deletedrivinglicenseapiv1drivinglicenseslicenseiddelete) | **DELETE** /api/v1/driving-licenses/{license_id} | Delete Driving License|
|[**getDrivingLicenseApiV1DrivingLicensesLicenseIdGet**](#getdrivinglicenseapiv1drivinglicenseslicenseidget) | **GET** /api/v1/driving-licenses/{license_id} | Get Driving License|
|[**getMyDrivingLicenseApiV1DrivingLicensesMyLicenseGet**](#getmydrivinglicenseapiv1drivinglicensesmylicenseget) | **GET** /api/v1/driving-licenses/my-license | Get My Driving License|
|[**updateDrivingLicenseApiV1DrivingLicensesLicenseIdPut**](#updatedrivinglicenseapiv1drivinglicenseslicenseidput) | **PUT** /api/v1/driving-licenses/{license_id} | Update Driving License|

# **checkLicenseStatusApiV1DrivingLicensesLicenseNumberStatusGet**
> any checkLicenseStatusApiV1DrivingLicensesLicenseNumberStatusGet()

Kiểm tra trạng thái bằng lái xe

### Example

```typescript
import {
    DrivingLicensesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DrivingLicensesApi(configuration);

let licenseNumber: string; // (default to undefined)

const { status, data } = await apiInstance.checkLicenseStatusApiV1DrivingLicensesLicenseNumberStatusGet(
    licenseNumber
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **licenseNumber** | [**string**] |  | defaults to undefined|


### Return type

**any**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createDrivingLicenseApiV1DrivingLicensesPost**
> DrivingLicenseResponse createDrivingLicenseApiV1DrivingLicensesPost(drivingLicenseCreate)

Tạo bằng lái xe mới

### Example

```typescript
import {
    DrivingLicensesApi,
    Configuration,
    DrivingLicenseCreate
} from './api';

const configuration = new Configuration();
const apiInstance = new DrivingLicensesApi(configuration);

let drivingLicenseCreate: DrivingLicenseCreate; //

const { status, data } = await apiInstance.createDrivingLicenseApiV1DrivingLicensesPost(
    drivingLicenseCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **drivingLicenseCreate** | **DrivingLicenseCreate**|  | |


### Return type

**DrivingLicenseResponse**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteDrivingLicenseApiV1DrivingLicensesLicenseIdDelete**
> any deleteDrivingLicenseApiV1DrivingLicensesLicenseIdDelete()

Xóa bằng lái xe

### Example

```typescript
import {
    DrivingLicensesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DrivingLicensesApi(configuration);

let licenseId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteDrivingLicenseApiV1DrivingLicensesLicenseIdDelete(
    licenseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **licenseId** | [**number**] |  | defaults to undefined|


### Return type

**any**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDrivingLicenseApiV1DrivingLicensesLicenseIdGet**
> DrivingLicenseResponse getDrivingLicenseApiV1DrivingLicensesLicenseIdGet()

Lấy thông tin bằng lái xe

### Example

```typescript
import {
    DrivingLicensesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DrivingLicensesApi(configuration);

let licenseId: number; // (default to undefined)

const { status, data } = await apiInstance.getDrivingLicenseApiV1DrivingLicensesLicenseIdGet(
    licenseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **licenseId** | [**number**] |  | defaults to undefined|


### Return type

**DrivingLicenseResponse**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyDrivingLicenseApiV1DrivingLicensesMyLicenseGet**
> DrivingLicenseResponse getMyDrivingLicenseApiV1DrivingLicensesMyLicenseGet()

Lấy bằng lái xe của người dùng hiện tại

### Example

```typescript
import {
    DrivingLicensesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DrivingLicensesApi(configuration);

const { status, data } = await apiInstance.getMyDrivingLicenseApiV1DrivingLicensesMyLicenseGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**DrivingLicenseResponse**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateDrivingLicenseApiV1DrivingLicensesLicenseIdPut**
> DrivingLicenseResponse updateDrivingLicenseApiV1DrivingLicensesLicenseIdPut(drivingLicenseUpdate)

Cập nhật thông tin bằng lái xe

### Example

```typescript
import {
    DrivingLicensesApi,
    Configuration,
    DrivingLicenseUpdate
} from './api';

const configuration = new Configuration();
const apiInstance = new DrivingLicensesApi(configuration);

let licenseId: number; // (default to undefined)
let drivingLicenseUpdate: DrivingLicenseUpdate; //

const { status, data } = await apiInstance.updateDrivingLicenseApiV1DrivingLicensesLicenseIdPut(
    licenseId,
    drivingLicenseUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **drivingLicenseUpdate** | **DrivingLicenseUpdate**|  | |
| **licenseId** | [**number**] |  | defaults to undefined|


### Return type

**DrivingLicenseResponse**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

