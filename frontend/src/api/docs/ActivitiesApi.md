# ActivitiesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getRecentActivitiesApiV1ActivitiesRecentGet**](#getrecentactivitiesapiv1activitiesrecentget) | **GET** /api/v1/activities/recent | Get Recent Activities|

# **getRecentActivitiesApiV1ActivitiesRecentGet**
> any getRecentActivitiesApiV1ActivitiesRecentGet()

Lấy danh sách hoạt động gần đây cho dashboard

### Example

```typescript
import {
    ActivitiesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ActivitiesApi(configuration);

let limit: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getRecentActivitiesApiV1ActivitiesRecentGet(
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**number**] |  | (optional) defaults to 10|


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

