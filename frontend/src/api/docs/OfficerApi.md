# OfficerApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createFinePaymentApiV1OfficerFinesViolationIdPost**](#createfinepaymentapiv1officerfinesviolationidpost) | **POST** /api/v1/officer/fines/{violation_id} | Create Fine Payment|
|[**createQrPaymentApiV1OfficerPaymentsQrUserIdPost**](#createqrpaymentapiv1officerpaymentsqruseridpost) | **POST** /api/v1/officer/payments/qr/{user_id} | Create Qr Payment|
|[**getAssignedComplaintsApiV1OfficerComplaintsAssignedGet**](#getassignedcomplaintsapiv1officercomplaintsassignedget) | **GET** /api/v1/officer/complaints/assigned | Get Assigned Complaints|
|[**getOfficerActivitiesApiV1OfficerDashboardActivitiesGet**](#getofficeractivitiesapiv1officerdashboardactivitiesget) | **GET** /api/v1/officer/dashboard/activities | Get Officer Activities|
|[**getOfficerDashboardApiV1OfficerDashboardStatsGet**](#getofficerdashboardapiv1officerdashboardstatsget) | **GET** /api/v1/officer/dashboard/stats | Get Officer Dashboard|
|[**getPaymentStatusApiV1OfficerPaymentsPaymentIdStatusGet**](#getpaymentstatusapiv1officerpaymentspaymentidstatusget) | **GET** /api/v1/officer/payments/{payment_id}/status | Get Payment Status|
|[**getReviewQueueApiV1OfficerViolationsReviewQueueGet**](#getreviewqueueapiv1officerviolationsreviewqueueget) | **GET** /api/v1/officer/violations/review-queue | Get Review Queue|
|[**reviewViolationApiV1OfficerViolationsViolationIdReviewPost**](#reviewviolationapiv1officerviolationsviolationidreviewpost) | **POST** /api/v1/officer/violations/{violation_id}/review | Review Violation|

# **createFinePaymentApiV1OfficerFinesViolationIdPost**
> any createFinePaymentApiV1OfficerFinesViolationIdPost()

Create fine payment for violation

### Example

```typescript
import {
    OfficerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OfficerApi(configuration);

let violationId: number; // (default to undefined)

const { status, data } = await apiInstance.createFinePaymentApiV1OfficerFinesViolationIdPost(
    violationId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **violationId** | [**number**] |  | defaults to undefined|


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

# **createQrPaymentApiV1OfficerPaymentsQrUserIdPost**
> any createQrPaymentApiV1OfficerPaymentsQrUserIdPost()


### Example

```typescript
import {
    OfficerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OfficerApi(configuration);

let userId: number; // (default to undefined)

const { status, data } = await apiInstance.createQrPaymentApiV1OfficerPaymentsQrUserIdPost(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|


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

# **getAssignedComplaintsApiV1OfficerComplaintsAssignedGet**
> any getAssignedComplaintsApiV1OfficerComplaintsAssignedGet()


### Example

```typescript
import {
    OfficerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OfficerApi(configuration);

const { status, data } = await apiInstance.getAssignedComplaintsApiV1OfficerComplaintsAssignedGet();
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

# **getOfficerActivitiesApiV1OfficerDashboardActivitiesGet**
> Array<RecentActivityResponse> getOfficerActivitiesApiV1OfficerDashboardActivitiesGet()

Lấy các hoạt động gần đây (vd: 10 hoạt động) cho officer hiện tại. Frontend (OverviewActivity) mong đợi một MẢNG (list) JSON.

### Example

```typescript
import {
    OfficerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OfficerApi(configuration);

const { status, data } = await apiInstance.getOfficerActivitiesApiV1OfficerDashboardActivitiesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<RecentActivityResponse>**

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

# **getOfficerDashboardApiV1OfficerDashboardStatsGet**
> any getOfficerDashboardApiV1OfficerDashboardStatsGet()


### Example

```typescript
import {
    OfficerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OfficerApi(configuration);

const { status, data } = await apiInstance.getOfficerDashboardApiV1OfficerDashboardStatsGet();
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

# **getPaymentStatusApiV1OfficerPaymentsPaymentIdStatusGet**
> any getPaymentStatusApiV1OfficerPaymentsPaymentIdStatusGet()


### Example

```typescript
import {
    OfficerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OfficerApi(configuration);

let paymentId: number; // (default to undefined)

const { status, data } = await apiInstance.getPaymentStatusApiV1OfficerPaymentsPaymentIdStatusGet(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**number**] |  | defaults to undefined|


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

# **getReviewQueueApiV1OfficerViolationsReviewQueueGet**
> ViolationListResponse getReviewQueueApiV1OfficerViolationsReviewQueueGet()

Get violations in review queue for officer

### Example

```typescript
import {
    OfficerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OfficerApi(configuration);

let skip: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 50)
let priority: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getReviewQueueApiV1OfficerViolationsReviewQueueGet(
    skip,
    limit,
    priority
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **limit** | [**number**] |  | (optional) defaults to 50|
| **priority** | [**string**] |  | (optional) defaults to undefined|


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

# **reviewViolationApiV1OfficerViolationsViolationIdReviewPost**
> ViolationResponse reviewViolationApiV1OfficerViolationsViolationIdReviewPost(violationReview)

Review violation with action (approve/reject) and optional notes

### Example

```typescript
import {
    OfficerApi,
    Configuration,
    ViolationReview
} from './api';

const configuration = new Configuration();
const apiInstance = new OfficerApi(configuration);

let violationId: number; // (default to undefined)
let violationReview: ViolationReview; //

const { status, data } = await apiInstance.reviewViolationApiV1OfficerViolationsViolationIdReviewPost(
    violationId,
    violationReview
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **violationReview** | **ViolationReview**|  | |
| **violationId** | [**number**] |  | defaults to undefined|


### Return type

**ViolationResponse**

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

