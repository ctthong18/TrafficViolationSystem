# StatisticsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getStatisticsApiV1StatisticsGet**](#getstatisticsapiv1statisticsget) | **GET** /api/v1/statistics | Get Statistics|

# **getStatisticsApiV1StatisticsGet**
> any getStatisticsApiV1StatisticsGet()

Lấy thống kê tổng quan cho dashboard

### Example

```typescript
import {
    StatisticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StatisticsApi(configuration);

let dateRange: string; //Time range: 7days, 30days, 3months, year (optional) (default to '7days')

const { status, data } = await apiInstance.getStatisticsApiV1StatisticsGet(
    dateRange
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dateRange** | [**string**] | Time range: 7days, 30days, 3months, year | (optional) defaults to '7days'|


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

