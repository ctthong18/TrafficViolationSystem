# ComplaintsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**assignComplaintApiV1ComplaintsComplaintIdAssignPost**](#assigncomplaintapiv1complaintscomplaintidassignpost) | **POST** /api/v1/complaints/{complaint_id}/assign | Assign Complaint|
|[**createAppealApiV1ComplaintsComplaintIdAppealsPost**](#createappealapiv1complaintscomplaintidappealspost) | **POST** /api/v1/complaints/{complaint_id}/appeals | Create Appeal|
|[**createComplaintApiV1ComplaintsPost**](#createcomplaintapiv1complaintspost) | **POST** /api/v1/complaints/ | Create Complaint|
|[**getAssignedComplaintsApiV1ComplaintsAssignedGet**](#getassignedcomplaintsapiv1complaintsassignedget) | **GET** /api/v1/complaints/assigned | Get Assigned Complaints|
|[**getComplaintActivitiesApiV1ComplaintsComplaintIdActivitiesGet**](#getcomplaintactivitiesapiv1complaintscomplaintidactivitiesget) | **GET** /api/v1/complaints/{complaint_id}/activities | Get Complaint Activities|
|[**getComplaintDetailApiV1ComplaintsComplaintIdGet**](#getcomplaintdetailapiv1complaintscomplaintidget) | **GET** /api/v1/complaints/{complaint_id} | Get Complaint Detail|
|[**getComplaintStatsApiV1ComplaintsStatsSummaryGet**](#getcomplaintstatsapiv1complaintsstatssummaryget) | **GET** /api/v1/complaints/stats/summary | Get Complaint Stats|
|[**getComplaintsApiV1ComplaintsGet**](#getcomplaintsapiv1complaintsget) | **GET** /api/v1/complaints/ | Get Complaints|
|[**getMyComplaintsApiV1ComplaintsMyComplaintsGet**](#getmycomplaintsapiv1complaintsmycomplaintsget) | **GET** /api/v1/complaints/my-complaints | Get My Complaints|
|[**rateComplaintResolutionApiV1ComplaintsComplaintIdRatePost**](#ratecomplaintresolutionapiv1complaintscomplaintidratepost) | **POST** /api/v1/complaints/{complaint_id}/rate | Rate Complaint Resolution|
|[**resolveComplaintApiV1ComplaintsComplaintIdResolvePost**](#resolvecomplaintapiv1complaintscomplaintidresolvepost) | **POST** /api/v1/complaints/{complaint_id}/resolve | Resolve Complaint|
|[**updateComplaintApiV1ComplaintsComplaintIdPut**](#updatecomplaintapiv1complaintscomplaintidput) | **PUT** /api/v1/complaints/{complaint_id} | Update Complaint|

# **assignComplaintApiV1ComplaintsComplaintIdAssignPost**
> any assignComplaintApiV1ComplaintsComplaintIdAssignPost()

Phân công khiếu nại cho officer

### Example

```typescript
import {
    ComplaintsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ComplaintsApi(configuration);

let complaintId: number; // (default to undefined)
let officerId: number; // (default to undefined)

const { status, data } = await apiInstance.assignComplaintApiV1ComplaintsComplaintIdAssignPost(
    complaintId,
    officerId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **complaintId** | [**number**] |  | defaults to undefined|
| **officerId** | [**number**] |  | defaults to undefined|


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

# **createAppealApiV1ComplaintsComplaintIdAppealsPost**
> AppealResponse createAppealApiV1ComplaintsComplaintIdAppealsPost(appealCreate)

Tạo kháng cáo cho khiếu nại

### Example

```typescript
import {
    ComplaintsApi,
    Configuration,
    AppealCreate
} from './api';

const configuration = new Configuration();
const apiInstance = new ComplaintsApi(configuration);

let complaintId: number; // (default to undefined)
let appealCreate: AppealCreate; //

const { status, data } = await apiInstance.createAppealApiV1ComplaintsComplaintIdAppealsPost(
    complaintId,
    appealCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **appealCreate** | **AppealCreate**|  | |
| **complaintId** | [**number**] |  | defaults to undefined|


### Return type

**AppealResponse**

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

# **createComplaintApiV1ComplaintsPost**
> ComplaintResponse createComplaintApiV1ComplaintsPost()

Tạo khiếu nại mới. Hỗ trợ cả JSON (ComplaintCreate) và multipart/form-data từ frontend.  - JSON body: theo schema ComplaintCreate - multipart/form-data: các field minimal như type, location, time, date, license_plate, description, evidence (file)

### Example

```typescript
import {
    ComplaintsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ComplaintsApi(configuration);

const { status, data } = await apiInstance.createComplaintApiV1ComplaintsPost();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ComplaintResponse**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAssignedComplaintsApiV1ComplaintsAssignedGet**
> ComplaintListResponse getAssignedComplaintsApiV1ComplaintsAssignedGet()

Lấy khiếu nại được phân công cho officer

### Example

```typescript
import {
    ComplaintsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ComplaintsApi(configuration);

const { status, data } = await apiInstance.getAssignedComplaintsApiV1ComplaintsAssignedGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ComplaintListResponse**

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

# **getComplaintActivitiesApiV1ComplaintsComplaintIdActivitiesGet**
> Array<ComplaintActivityResponse> getComplaintActivitiesApiV1ComplaintsComplaintIdActivitiesGet()

Lấy lịch sử hoạt động của khiếu nại

### Example

```typescript
import {
    ComplaintsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ComplaintsApi(configuration);

let complaintId: number; // (default to undefined)

const { status, data } = await apiInstance.getComplaintActivitiesApiV1ComplaintsComplaintIdActivitiesGet(
    complaintId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **complaintId** | [**number**] |  | defaults to undefined|


### Return type

**Array<ComplaintActivityResponse>**

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

# **getComplaintDetailApiV1ComplaintsComplaintIdGet**
> ComplaintResponse getComplaintDetailApiV1ComplaintsComplaintIdGet()

Lấy chi tiết khiếu nại

### Example

```typescript
import {
    ComplaintsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ComplaintsApi(configuration);

let complaintId: number; // (default to undefined)

const { status, data } = await apiInstance.getComplaintDetailApiV1ComplaintsComplaintIdGet(
    complaintId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **complaintId** | [**number**] |  | defaults to undefined|


### Return type

**ComplaintResponse**

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

# **getComplaintStatsApiV1ComplaintsStatsSummaryGet**
> any getComplaintStatsApiV1ComplaintsStatsSummaryGet()

Lấy thống kê khiếu nại

### Example

```typescript
import {
    ComplaintsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ComplaintsApi(configuration);

let startDate: string; //Start date (YYYY-MM-DD) (default to undefined)
let endDate: string; //End date (YYYY-MM-DD) (default to undefined)

const { status, data } = await apiInstance.getComplaintStatsApiV1ComplaintsStatsSummaryGet(
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

# **getComplaintsApiV1ComplaintsGet**
> ComplaintListResponse getComplaintsApiV1ComplaintsGet()

Lấy danh sách khiếu nại

### Example

```typescript
import {
    ComplaintsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ComplaintsApi(configuration);

let status: ComplaintStatus; // (optional) (default to undefined)
let complaintType: ComplaintType; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 50)

const { status, data } = await apiInstance.getComplaintsApiV1ComplaintsGet(
    status,
    complaintType,
    skip,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | **ComplaintStatus** |  | (optional) defaults to undefined|
| **complaintType** | **ComplaintType** |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **limit** | [**number**] |  | (optional) defaults to 50|


### Return type

**ComplaintListResponse**

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

# **getMyComplaintsApiV1ComplaintsMyComplaintsGet**
> ComplaintListResponse getMyComplaintsApiV1ComplaintsMyComplaintsGet()

Lấy khiếu nại của người dùng hiện tại

### Example

```typescript
import {
    ComplaintsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ComplaintsApi(configuration);

const { status, data } = await apiInstance.getMyComplaintsApiV1ComplaintsMyComplaintsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ComplaintListResponse**

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

# **rateComplaintResolutionApiV1ComplaintsComplaintIdRatePost**
> any rateComplaintResolutionApiV1ComplaintsComplaintIdRatePost()

Đánh giá giải quyết khiếu nại

### Example

```typescript
import {
    ComplaintsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ComplaintsApi(configuration);

let complaintId: number; // (default to undefined)
let rating: number; // (default to undefined)
let feedback: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.rateComplaintResolutionApiV1ComplaintsComplaintIdRatePost(
    complaintId,
    rating,
    feedback
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **complaintId** | [**number**] |  | defaults to undefined|
| **rating** | [**number**] |  | defaults to undefined|
| **feedback** | [**string**] |  | (optional) defaults to undefined|


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

# **resolveComplaintApiV1ComplaintsComplaintIdResolvePost**
> ComplaintResponse resolveComplaintApiV1ComplaintsComplaintIdResolvePost()

Giải quyết khiếu nại

### Example

```typescript
import {
    ComplaintsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ComplaintsApi(configuration);

let complaintId: number; // (default to undefined)
let resolution: string; // (default to undefined)

const { status, data } = await apiInstance.resolveComplaintApiV1ComplaintsComplaintIdResolvePost(
    complaintId,
    resolution
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **complaintId** | [**number**] |  | defaults to undefined|
| **resolution** | [**string**] |  | defaults to undefined|


### Return type

**ComplaintResponse**

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

# **updateComplaintApiV1ComplaintsComplaintIdPut**
> ComplaintResponse updateComplaintApiV1ComplaintsComplaintIdPut(complaintUpdate)

Cập nhật khiếu nại (Officer/Admin only)

### Example

```typescript
import {
    ComplaintsApi,
    Configuration,
    ComplaintUpdate
} from './api';

const configuration = new Configuration();
const apiInstance = new ComplaintsApi(configuration);

let complaintId: number; // (default to undefined)
let complaintUpdate: ComplaintUpdate; //

const { status, data } = await apiInstance.updateComplaintApiV1ComplaintsComplaintIdPut(
    complaintId,
    complaintUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **complaintUpdate** | **ComplaintUpdate**|  | |
| **complaintId** | [**number**] |  | defaults to undefined|


### Return type

**ComplaintResponse**

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

