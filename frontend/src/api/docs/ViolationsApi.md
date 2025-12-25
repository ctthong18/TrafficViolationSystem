# ViolationsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getProcessedViolationsApiV1ViolationsProcessedListGet**](#getprocessedviolationsapiv1violationsprocessedlistget) | **GET** /api/v1/violations/processed/list | Get Processed Violations|
|[**getRecentViolationsApiV1ViolationsRecentGet**](#getrecentviolationsapiv1violationsrecentget) | **GET** /api/v1/violations/recent | Get Recent Violations|
|[**getViolationDetailApiV1ViolationsViolationIdGet**](#getviolationdetailapiv1violationsviolationidget) | **GET** /api/v1/violations/{violation_id} | Get Violation Detail|
|[**getViolationsApiV1ViolationsGet**](#getviolationsapiv1violationsget) | **GET** /api/v1/violations/ | Get Violations|

# **getProcessedViolationsApiV1ViolationsProcessedListGet**
> ViolationListResponse getProcessedViolationsApiV1ViolationsProcessedListGet()

Get list of processed violations

### Example

```typescript
import {
    ViolationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ViolationsApi(configuration);

let skip: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 50)

const { status, data } = await apiInstance.getProcessedViolationsApiV1ViolationsProcessedListGet(
    skip,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **limit** | [**number**] |  | (optional) defaults to 50|


### Return type

**ViolationListResponse**

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

# **getRecentViolationsApiV1ViolationsRecentGet**
> any getRecentViolationsApiV1ViolationsRecentGet()

Lấy danh sách vi phạm gần đây cho dashboard

### Example

```typescript
import {
    ViolationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ViolationsApi(configuration);

const { status, data } = await apiInstance.getRecentViolationsApiV1ViolationsRecentGet();
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

# **getViolationDetailApiV1ViolationsViolationIdGet**
> ViolationResponse getViolationDetailApiV1ViolationsViolationIdGet()


### Example

```typescript
import {
    ViolationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ViolationsApi(configuration);

let violationId: number; // (default to undefined)

const { status, data } = await apiInstance.getViolationDetailApiV1ViolationsViolationIdGet(
    violationId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **violationId** | [**number**] |  | defaults to undefined|


### Return type

**ViolationResponse**

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

# **getViolationsApiV1ViolationsGet**
> ViolationListResponse getViolationsApiV1ViolationsGet()


### Example

```typescript
import {
    ViolationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ViolationsApi(configuration);

let skip: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 50)
let status: string; // (optional) (default to undefined)
let licensePlate: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getViolationsApiV1ViolationsGet(
    skip,
    limit,
    status,
    licensePlate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **limit** | [**number**] |  | (optional) defaults to 50|
| **status** | [**string**] |  | (optional) defaults to undefined|
| **licensePlate** | [**string**] |  | (optional) defaults to undefined|


### Return type

**ViolationListResponse**

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

