# VehiclesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deleteVehicleApiV1VehiclesVehicleIdDelete**](#deletevehicleapiv1vehiclesvehicleiddelete) | **DELETE** /api/v1/vehicles/{vehicle_id} | Delete Vehicle|
|[**getMyVehiclesApiV1VehiclesMyVehiclesGet**](#getmyvehiclesapiv1vehiclesmyvehiclesget) | **GET** /api/v1/vehicles/my-vehicles | Get My Vehicles|
|[**getVehicleByLicensePlateApiV1VehiclesLicensePlateLicensePlateGet**](#getvehiclebylicenseplateapiv1vehicleslicenseplatelicenseplateget) | **GET** /api/v1/vehicles/license-plate/{license_plate} | Get Vehicle By License Plate|
|[**getVehicleDetailApiV1VehiclesVehicleIdGet**](#getvehicledetailapiv1vehiclesvehicleidget) | **GET** /api/v1/vehicles/{vehicle_id} | Get Vehicle Detail|
|[**getVehiclePaymentHistoryApiV1VehiclesVehicleIdPaymentHistoryGet**](#getvehiclepaymenthistoryapiv1vehiclesvehicleidpaymenthistoryget) | **GET** /api/v1/vehicles/{vehicle_id}/payment-history | Get Vehicle Payment History|
|[**getVehicleViolationStatsApiV1VehiclesVehicleIdViolationsStatsGet**](#getvehicleviolationstatsapiv1vehiclesvehicleidviolationsstatsget) | **GET** /api/v1/vehicles/{vehicle_id}/violations/stats | Get Vehicle Violation Stats|
|[**getVehicleViolationsApiV1VehiclesVehicleIdViolationsGet**](#getvehicleviolationsapiv1vehiclesvehicleidviolationsget) | **GET** /api/v1/vehicles/{vehicle_id}/violations | Get Vehicle Violations|
|[**getVehiclesApiV1VehiclesGet**](#getvehiclesapiv1vehiclesget) | **GET** /api/v1/vehicles/ | Get Vehicles|
|[**registerVehicleApiV1VehiclesPost**](#registervehicleapiv1vehiclespost) | **POST** /api/v1/vehicles/ | Register Vehicle|
|[**updateVehicleApiV1VehiclesVehicleIdPut**](#updatevehicleapiv1vehiclesvehicleidput) | **PUT** /api/v1/vehicles/{vehicle_id} | Update Vehicle|

# **deleteVehicleApiV1VehiclesVehicleIdDelete**
> deleteVehicleApiV1VehiclesVehicleIdDelete()

Xóa phương tiện

### Example

```typescript
import {
    VehiclesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VehiclesApi(configuration);

let vehicleId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteVehicleApiV1VehiclesVehicleIdDelete(
    vehicleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vehicleId** | [**number**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyVehiclesApiV1VehiclesMyVehiclesGet**
> Array<VehicleResponse> getMyVehiclesApiV1VehiclesMyVehiclesGet()

Lấy danh sách phương tiện của người dùng hiện tại

### Example

```typescript
import {
    VehiclesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VehiclesApi(configuration);

const { status, data } = await apiInstance.getMyVehiclesApiV1VehiclesMyVehiclesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<VehicleResponse>**

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

# **getVehicleByLicensePlateApiV1VehiclesLicensePlateLicensePlateGet**
> VehicleResponse getVehicleByLicensePlateApiV1VehiclesLicensePlateLicensePlateGet()

Tìm phương tiện bằng biển số (Admin/Officer only)

### Example

```typescript
import {
    VehiclesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VehiclesApi(configuration);

let licensePlate: string; // (default to undefined)

const { status, data } = await apiInstance.getVehicleByLicensePlateApiV1VehiclesLicensePlateLicensePlateGet(
    licensePlate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **licensePlate** | [**string**] |  | defaults to undefined|


### Return type

**VehicleResponse**

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

# **getVehicleDetailApiV1VehiclesVehicleIdGet**
> VehicleResponse getVehicleDetailApiV1VehiclesVehicleIdGet()

Lấy thông tin chi tiết phương tiện

### Example

```typescript
import {
    VehiclesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VehiclesApi(configuration);

let vehicleId: number; // (default to undefined)

const { status, data } = await apiInstance.getVehicleDetailApiV1VehiclesVehicleIdGet(
    vehicleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vehicleId** | [**number**] |  | defaults to undefined|


### Return type

**VehicleResponse**

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

# **getVehiclePaymentHistoryApiV1VehiclesVehicleIdPaymentHistoryGet**
> any getVehiclePaymentHistoryApiV1VehiclesVehicleIdPaymentHistoryGet()

Lấy lịch sử thanh toán của phương tiện

### Example

```typescript
import {
    VehiclesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VehiclesApi(configuration);

let vehicleId: number; // (default to undefined)

const { status, data } = await apiInstance.getVehiclePaymentHistoryApiV1VehiclesVehicleIdPaymentHistoryGet(
    vehicleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vehicleId** | [**number**] |  | defaults to undefined|


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

# **getVehicleViolationStatsApiV1VehiclesVehicleIdViolationsStatsGet**
> any getVehicleViolationStatsApiV1VehiclesVehicleIdViolationsStatsGet()

Lấy thống kê vi phạm của phương tiện

### Example

```typescript
import {
    VehiclesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VehiclesApi(configuration);

let vehicleId: number; // (default to undefined)

const { status, data } = await apiInstance.getVehicleViolationStatsApiV1VehiclesVehicleIdViolationsStatsGet(
    vehicleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vehicleId** | [**number**] |  | defaults to undefined|


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

# **getVehicleViolationsApiV1VehiclesVehicleIdViolationsGet**
> any getVehicleViolationsApiV1VehiclesVehicleIdViolationsGet()

Lấy danh sách vi phạm của phương tiện

### Example

```typescript
import {
    VehiclesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VehiclesApi(configuration);

let vehicleId: number; // (default to undefined)

const { status, data } = await apiInstance.getVehicleViolationsApiV1VehiclesVehicleIdViolationsGet(
    vehicleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vehicleId** | [**number**] |  | defaults to undefined|


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

# **getVehiclesApiV1VehiclesGet**
> Array<VehicleResponse> getVehiclesApiV1VehiclesGet()

Tìm kiếm phương tiện (Admin/Officer only)

### Example

```typescript
import {
    VehiclesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VehiclesApi(configuration);

let licensePlate: string; // (optional) (default to undefined)
let ownerName: string; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 50)

const { status, data } = await apiInstance.getVehiclesApiV1VehiclesGet(
    licensePlate,
    ownerName,
    skip,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **licensePlate** | [**string**] |  | (optional) defaults to undefined|
| **ownerName** | [**string**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **limit** | [**number**] |  | (optional) defaults to 50|


### Return type

**Array<VehicleResponse>**

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

# **registerVehicleApiV1VehiclesPost**
> VehicleResponse registerVehicleApiV1VehiclesPost(vehicleCreate)

Đăng ký phương tiện mới

### Example

```typescript
import {
    VehiclesApi,
    Configuration,
    VehicleCreate
} from './api';

const configuration = new Configuration();
const apiInstance = new VehiclesApi(configuration);

let vehicleCreate: VehicleCreate; //

const { status, data } = await apiInstance.registerVehicleApiV1VehiclesPost(
    vehicleCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vehicleCreate** | **VehicleCreate**|  | |


### Return type

**VehicleResponse**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateVehicleApiV1VehiclesVehicleIdPut**
> VehicleResponse updateVehicleApiV1VehiclesVehicleIdPut(vehicleUpdate)

Cập nhật thông tin phương tiện

### Example

```typescript
import {
    VehiclesApi,
    Configuration,
    VehicleUpdate
} from './api';

const configuration = new Configuration();
const apiInstance = new VehiclesApi(configuration);

let vehicleId: number; // (default to undefined)
let vehicleUpdate: VehicleUpdate; //

const { status, data } = await apiInstance.updateVehicleApiV1VehiclesVehicleIdPut(
    vehicleId,
    vehicleUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vehicleUpdate** | **VehicleUpdate**|  | |
| **vehicleId** | [**number**] |  | defaults to undefined|


### Return type

**VehicleResponse**

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

