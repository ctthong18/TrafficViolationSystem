# CalendarAnalyticsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getCalendarDailyStatsApiV1AnalyticsAnalyticsCalendarDailyStatsGet**](#getcalendardailystatsapiv1analyticsanalyticscalendardailystatsget) | **GET** /api/v1/analytics/analytics/calendar-daily-stats | Get Calendar Daily Stats|
|[**getCalendarRangeDataApiV1AnalyticsAnalyticsCalendarRangeGet**](#getcalendarrangedataapiv1analyticsanalyticscalendarrangeget) | **GET** /api/v1/analytics/analytics/calendar-range | Get Calendar Range Data|

# **getCalendarDailyStatsApiV1AnalyticsAnalyticsCalendarDailyStatsGet**
> any getCalendarDailyStatsApiV1AnalyticsAnalyticsCalendarDailyStatsGet()

Lấy thống kê cho 1 ngày cụ thể (hover effect)

### Example

```typescript
import {
    CalendarAnalyticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarAnalyticsApi(configuration);

let date: string; //Specific date (YYYY-MM-DD) (default to undefined)

const { status, data } = await apiInstance.getCalendarDailyStatsApiV1AnalyticsAnalyticsCalendarDailyStatsGet(
    date
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **date** | [**string**] | Specific date (YYYY-MM-DD) | defaults to undefined|


### Return type

**any**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCalendarRangeDataApiV1AnalyticsAnalyticsCalendarRangeGet**
> any getCalendarRangeDataApiV1AnalyticsAnalyticsCalendarRangeGet()

Lấy dữ liệu cho calendar range picker

### Example

```typescript
import {
    CalendarAnalyticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarAnalyticsApi(configuration);

let startDate: string; //Start date (YYYY-MM-DD) (default to undefined)
let endDate: string; //End date (YYYY-MM-DD) (default to undefined)

const { status, data } = await apiInstance.getCalendarRangeDataApiV1AnalyticsAnalyticsCalendarRangeGet(
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

**any**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

