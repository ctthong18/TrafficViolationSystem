# DenunciationsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createDenunciationApiV1DenunciationsPost**](#createdenunciationapiv1denunciationspost) | **POST** /api/v1/denunciations/ | Create Denunciation|
|[**getAssignedDenunciationsApiV1DenunciationsAssignedGet**](#getassigneddenunciationsapiv1denunciationsassignedget) | **GET** /api/v1/denunciations/assigned | Get Assigned Denunciations|
|[**getDenunciationStatsApiV1DenunciationsStatsGet**](#getdenunciationstatsapiv1denunciationsstatsget) | **GET** /api/v1/denunciations/stats | Get Denunciation Stats|
|[**getDenunciationsApiV1DenunciationsGet**](#getdenunciationsapiv1denunciationsget) | **GET** /api/v1/denunciations/ | Get Denunciations|

# **createDenunciationApiV1DenunciationsPost**
> DenunciationResponse createDenunciationApiV1DenunciationsPost(denunciationCreate)

Tạo tố cáo mới (có thể ẩn danh)

### Example

```typescript
import {
    DenunciationsApi,
    Configuration,
    DenunciationCreate
} from './api';

const configuration = new Configuration();
const apiInstance = new DenunciationsApi(configuration);

let denunciationCreate: DenunciationCreate; //

const { status, data } = await apiInstance.createDenunciationApiV1DenunciationsPost(
    denunciationCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **denunciationCreate** | **DenunciationCreate**|  | |


### Return type

**DenunciationResponse**

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

# **getAssignedDenunciationsApiV1DenunciationsAssignedGet**
> DenunciationListResponse getAssignedDenunciationsApiV1DenunciationsAssignedGet()

Lấy tố cáo được phân công cho điều tra viên

### Example

```typescript
import {
    DenunciationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DenunciationsApi(configuration);

const { status, data } = await apiInstance.getAssignedDenunciationsApiV1DenunciationsAssignedGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**DenunciationListResponse**

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

# **getDenunciationStatsApiV1DenunciationsStatsGet**
> DenunciationStatsResponse getDenunciationStatsApiV1DenunciationsStatsGet()

Lấy thống kê tố cáo

### Example

```typescript
import {
    DenunciationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DenunciationsApi(configuration);

let startDate: string; //Start date (YYYY-MM-DD) (default to undefined)
let endDate: string; //End date (YYYY-MM-DD) (default to undefined)

const { status, data } = await apiInstance.getDenunciationStatsApiV1DenunciationsStatsGet(
    startDate,
    endDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **startDate** | [**string**] | Start date (YYYY-MM-DD) | defaults to undefined|
| **endDate** | [**string**] | End date (YYYY-MM-DD) | defaults to undefined|


### Return type

**DenunciationStatsResponse**

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

# **getDenunciationsApiV1DenunciationsGet**
> DenunciationListResponse getDenunciationsApiV1DenunciationsGet()

Lấy danh sách tố cáo

### Example

```typescript
import {
    DenunciationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DenunciationsApi(configuration);

let status: DenunciationStatus; // (optional) (default to undefined)
let denunciationType: DenunciationType; // (optional) (default to undefined)
let severity: string; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 50)

const { status, data } = await apiInstance.getDenunciationsApiV1DenunciationsGet(
    status,
    denunciationType,
    severity,
    skip,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | **DenunciationStatus** |  | (optional) defaults to undefined|
| **denunciationType** | **DenunciationType** |  | (optional) defaults to undefined|
| **severity** | [**string**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **limit** | [**number**] |  | (optional) defaults to 50|


### Return type

**DenunciationListResponse**

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

