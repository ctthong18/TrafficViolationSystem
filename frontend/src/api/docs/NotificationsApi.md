# NotificationsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getNotificationApiV1NotificationsNotificationIdGet**](#getnotificationapiv1notificationsnotificationidget) | **GET** /api/v1/notifications/{notification_id} | Get Notification|
|[**getNotificationsApiV1NotificationsGet**](#getnotificationsapiv1notificationsget) | **GET** /api/v1/notifications/ | Get Notifications|
|[**getUnreadCountApiV1NotificationsUnreadCountGet**](#getunreadcountapiv1notificationsunreadcountget) | **GET** /api/v1/notifications/unread-count | Get Unread Count|
|[**markAllNotificationsReadApiV1NotificationsMarkAllReadPost**](#markallnotificationsreadapiv1notificationsmarkallreadpost) | **POST** /api/v1/notifications/mark-all-read | Mark All Notifications Read|
|[**markNotificationReadApiV1NotificationsNotificationIdReadPost**](#marknotificationreadapiv1notificationsnotificationidreadpost) | **POST** /api/v1/notifications/{notification_id}/read | Mark Notification Read|

# **getNotificationApiV1NotificationsNotificationIdGet**
> NotificationResponse getNotificationApiV1NotificationsNotificationIdGet()

Get a specific notification by ID.  Path Parameters: - notification_id: ID of the notification  Returns: - Notification details

### Example

```typescript
import {
    NotificationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationsApi(configuration);

let notificationId: number; // (default to undefined)

const { status, data } = await apiInstance.getNotificationApiV1NotificationsNotificationIdGet(
    notificationId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **notificationId** | [**number**] |  | defaults to undefined|


### Return type

**NotificationResponse**

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

# **getNotificationsApiV1NotificationsGet**
> NotificationListResponse getNotificationsApiV1NotificationsGet()

Get notifications for the current user.  Query Parameters: - unread_only: If true, only return unread notifications - skip: Number of records to skip (pagination) - limit: Maximum number of records to return  Returns: - List of notifications with pagination info

### Example

```typescript
import {
    NotificationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationsApi(configuration);

let unreadOnly: boolean; //Only return unread notifications (optional) (default to false)
let skip: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 50)

const { status, data } = await apiInstance.getNotificationsApiV1NotificationsGet(
    unreadOnly,
    skip,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **unreadOnly** | [**boolean**] | Only return unread notifications | (optional) defaults to false|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **limit** | [**number**] |  | (optional) defaults to 50|


### Return type

**NotificationListResponse**

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

# **getUnreadCountApiV1NotificationsUnreadCountGet**
> { [key: string]: any; } getUnreadCountApiV1NotificationsUnreadCountGet()

Get count of unread notifications for the current user.  Returns: - unread_count: Number of unread notifications

### Example

```typescript
import {
    NotificationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationsApi(configuration);

const { status, data } = await apiInstance.getUnreadCountApiV1NotificationsUnreadCountGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: any; }**

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

# **markAllNotificationsReadApiV1NotificationsMarkAllReadPost**
> { [key: string]: any; } markAllNotificationsReadApiV1NotificationsMarkAllReadPost()

Mark all notifications as read for the current user.  Returns: - count: Number of notifications marked as read

### Example

```typescript
import {
    NotificationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationsApi(configuration);

const { status, data } = await apiInstance.markAllNotificationsReadApiV1NotificationsMarkAllReadPost();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: any; }**

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

# **markNotificationReadApiV1NotificationsNotificationIdReadPost**
> NotificationResponse markNotificationReadApiV1NotificationsNotificationIdReadPost()

Mark a notification as read.  Path Parameters: - notification_id: ID of the notification to mark as read  Returns: - Updated notification

### Example

```typescript
import {
    NotificationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationsApi(configuration);

let notificationId: number; // (default to undefined)

const { status, data } = await apiInstance.markNotificationReadApiV1NotificationsNotificationIdReadPost(
    notificationId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **notificationId** | [**number**] |  | defaults to undefined|


### Return type

**NotificationResponse**

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

