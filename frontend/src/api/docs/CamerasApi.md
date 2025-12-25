# CamerasApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createCameraApiV1CamerasPost**](#createcameraapiv1cameraspost) | **POST** /api/v1/cameras/ | Create Camera|
|[**deleteCameraApiV1CamerasCameraIdDelete**](#deletecameraapiv1camerascameraiddelete) | **DELETE** /api/v1/cameras/{camera_id} | Delete Camera|
|[**getCameraApiV1CamerasCameraIdGet**](#getcameraapiv1camerascameraidget) | **GET** /api/v1/cameras/{camera_id} | Get Camera|
|[**getCameraVideosApiV1CamerasCameraIdVideosGet**](#getcameravideosapiv1camerascameraidvideosget) | **GET** /api/v1/cameras/{camera_id}/videos | Get Camera Videos|
|[**listCamerasApiV1CamerasGet**](#listcamerasapiv1camerasget) | **GET** /api/v1/cameras/ | List Cameras|
|[**updateCameraApiV1CamerasCameraIdPut**](#updatecameraapiv1camerascameraidput) | **PUT** /api/v1/cameras/{camera_id} | Update Camera|

# **createCameraApiV1CamerasPost**
> CameraResponse createCameraApiV1CamerasPost(cameraCreate)


### Example

```typescript
import {
    CamerasApi,
    Configuration,
    CameraCreate
} from './api';

const configuration = new Configuration();
const apiInstance = new CamerasApi(configuration);

let cameraCreate: CameraCreate; //

const { status, data } = await apiInstance.createCameraApiV1CamerasPost(
    cameraCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cameraCreate** | **CameraCreate**|  | |


### Return type

**CameraResponse**

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

# **deleteCameraApiV1CamerasCameraIdDelete**
> any deleteCameraApiV1CamerasCameraIdDelete()


### Example

```typescript
import {
    CamerasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CamerasApi(configuration);

let cameraId: string; // (default to undefined)

const { status, data } = await apiInstance.deleteCameraApiV1CamerasCameraIdDelete(
    cameraId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cameraId** | [**string**] |  | defaults to undefined|


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

# **getCameraApiV1CamerasCameraIdGet**
> CameraResponse getCameraApiV1CamerasCameraIdGet()


### Example

```typescript
import {
    CamerasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CamerasApi(configuration);

let cameraId: string; // (default to undefined)

const { status, data } = await apiInstance.getCameraApiV1CamerasCameraIdGet(
    cameraId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cameraId** | [**string**] |  | defaults to undefined|


### Return type

**CameraResponse**

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

# **getCameraVideosApiV1CamerasCameraIdVideosGet**
> VideoListResponse getCameraVideosApiV1CamerasCameraIdVideosGet()

Get all videos for a specific camera with filtering and pagination  - **camera_id**: ID of the camera - **skip**: Number of records to skip (for pagination) - **limit**: Maximum number of records to return - **has_violations**: Filter by videos with/without violations - **date_from**: Filter videos from this date (ISO format) - **date_to**: Filter videos until this date (ISO format)  Returns paginated list of videos

### Example

```typescript
import {
    CamerasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CamerasApi(configuration);

let cameraId: string; // (default to undefined)
let skip: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 20)
let hasViolations: boolean; // (optional) (default to undefined)
let dateFrom: string; // (optional) (default to undefined)
let dateTo: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getCameraVideosApiV1CamerasCameraIdVideosGet(
    cameraId,
    skip,
    limit,
    hasViolations,
    dateFrom,
    dateTo
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cameraId** | [**string**] |  | defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **limit** | [**number**] |  | (optional) defaults to 20|
| **hasViolations** | [**boolean**] |  | (optional) defaults to undefined|
| **dateFrom** | [**string**] |  | (optional) defaults to undefined|
| **dateTo** | [**string**] |  | (optional) defaults to undefined|


### Return type

**VideoListResponse**

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

# **listCamerasApiV1CamerasGet**
> CameraListResponse listCamerasApiV1CamerasGet()


### Example

```typescript
import {
    CamerasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CamerasApi(configuration);

let skip: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 50)
let status: string; // (optional) (default to undefined)
let search: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.listCamerasApiV1CamerasGet(
    skip,
    limit,
    status,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **limit** | [**number**] |  | (optional) defaults to 50|
| **status** | [**string**] |  | (optional) defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|


### Return type

**CameraListResponse**

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

# **updateCameraApiV1CamerasCameraIdPut**
> CameraResponse updateCameraApiV1CamerasCameraIdPut(cameraUpdate)


### Example

```typescript
import {
    CamerasApi,
    Configuration,
    CameraUpdate
} from './api';

const configuration = new Configuration();
const apiInstance = new CamerasApi(configuration);

let cameraId: string; // (default to undefined)
let cameraUpdate: CameraUpdate; //

const { status, data } = await apiInstance.updateCameraApiV1CamerasCameraIdPut(
    cameraId,
    cameraUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cameraUpdate** | **CameraUpdate**|  | |
| **cameraId** | [**string**] |  | defaults to undefined|


### Return type

**CameraResponse**

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

