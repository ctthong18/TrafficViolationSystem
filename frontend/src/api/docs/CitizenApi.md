# CitizenApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getCitizenDashboardApiV1CitizenDashboardStatsGet**](#getcitizendashboardapiv1citizendashboardstatsget) | **GET** /api/v1/citizen/dashboard/stats | Get Citizen Dashboard|
|[**getMyVehiclesApiV1CitizenMyVehiclesGet**](#getmyvehiclesapiv1citizenmyvehiclesget) | **GET** /api/v1/citizen/my-vehicles | Get My Vehicles|
|[**getMyViolationsApiV1CitizenMyViolationsGet**](#getmyviolationsapiv1citizenmyviolationsget) | **GET** /api/v1/citizen/my-violations | Get My Violations|
|[**getPersonalInfoApiV1CitizenPersonalInfoGet**](#getpersonalinfoapiv1citizenpersonalinfoget) | **GET** /api/v1/citizen/personal-info | Get Personal Info|
|[**registerVehicleApiV1CitizenVehiclesPost**](#registervehicleapiv1citizenvehiclespost) | **POST** /api/v1/citizen/vehicles | Register Vehicle|

# **getCitizenDashboardApiV1CitizenDashboardStatsGet**
> any getCitizenDashboardApiV1CitizenDashboardStatsGet()


### Example

```typescript
import {
    CitizenApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CitizenApi(configuration);

const { status, data } = await apiInstance.getCitizenDashboardApiV1CitizenDashboardStatsGet();
```

### Parameters
This endpoint does not have any parameters.


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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyVehiclesApiV1CitizenMyVehiclesGet**
> any getMyVehiclesApiV1CitizenMyVehiclesGet()


### Example

```typescript
import {
    CitizenApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CitizenApi(configuration);

const { status, data } = await apiInstance.getMyVehiclesApiV1CitizenMyVehiclesGet();
```

### Parameters
This endpoint does not have any parameters.


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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyViolationsApiV1CitizenMyViolationsGet**
> any getMyViolationsApiV1CitizenMyViolationsGet()

Lấy vi phạm của chính citizen này

### Example

```typescript
import {
    CitizenApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CitizenApi(configuration);

const { status, data } = await apiInstance.getMyViolationsApiV1CitizenMyViolationsGet();
```

### Parameters
This endpoint does not have any parameters.


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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPersonalInfoApiV1CitizenPersonalInfoGet**
> any getPersonalInfoApiV1CitizenPersonalInfoGet()

Lấy thông tin cá nhân của người dùng hiện tại (Citizen / Officer / Admin)

### Example

```typescript
import {
    CitizenApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CitizenApi(configuration);

const { status, data } = await apiInstance.getPersonalInfoApiV1CitizenPersonalInfoGet();
```

### Parameters
This endpoint does not have any parameters.


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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **registerVehicleApiV1CitizenVehiclesPost**
> VehicleResponse registerVehicleApiV1CitizenVehiclesPost(vehicleCreate)

Đăng ký phương tiện mới (Citizen)

### Example

```typescript
import {
    CitizenApi,
    Configuration,
    VehicleCreate
} from './api';

const configuration = new Configuration();
const apiInstance = new CitizenApi(configuration);

let vehicleCreate: VehicleCreate; //

const { status, data } = await apiInstance.registerVehicleApiV1CitizenVehiclesPost(
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

