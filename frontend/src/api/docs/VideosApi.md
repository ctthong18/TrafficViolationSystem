# VideosApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deleteVideoApiV1VideosVideoIdDelete**](#deletevideoapiv1videosvideoiddelete) | **DELETE** /api/v1/videos/{video_id} | Delete Video|
|[**getCameraVideoStatsApiV1VideosCamerasCameraIdVideoStatsGet**](#getcameravideostatsapiv1videoscamerascameraidvideostatsget) | **GET** /api/v1/videos/cameras/{camera_id}/video-stats | Get Camera Video Stats|
|[**getCameraVideosApiV1VideosCamerasCameraIdVideosGet**](#getcameravideosapiv1videoscamerascameraidvideosget) | **GET** /api/v1/videos/cameras/{camera_id}/videos | Get Camera Videos|
|[**getVideoApiV1VideosVideoIdGet**](#getvideoapiv1videosvideoidget) | **GET** /api/v1/videos/{video_id} | Get Video|
|[**uploadVideoApiV1VideosUploadPost**](#uploadvideoapiv1videosuploadpost) | **POST** /api/v1/videos/upload | Upload Video|

# **deleteVideoApiV1VideosVideoIdDelete**
> any deleteVideoApiV1VideosVideoIdDelete()

Delete a video from both Cloudinary and database  - **video_id**: ID of the video to delete  Returns success message  Security: Audit logged for compliance

### Example

```typescript
import {
    VideosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VideosApi(configuration);

let videoId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteVideoApiV1VideosVideoIdDelete(
    videoId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **videoId** | [**number**] |  | defaults to undefined|


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

# **getCameraVideoStatsApiV1VideosCamerasCameraIdVideoStatsGet**
> VideoStatsResponse getCameraVideoStatsApiV1VideosCamerasCameraIdVideoStatsGet()

Get video statistics for a specific camera  - **camera_id**: ID of the camera - **date_from**: Optional start date filter (YYYY-MM-DD) - **date_to**: Optional end date filter (YYYY-MM-DD)  Returns: - Total videos count - Total duration (seconds) - Total violations detected - Videos with violations count - Average video duration - Statistics grouped by date for charts

### Example

```typescript
import {
    VideosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VideosApi(configuration);

let cameraId: number; // (default to undefined)
let dateFrom: string; //Start date (YYYY-MM-DD) (optional) (default to undefined)
let dateTo: string; //End date (YYYY-MM-DD) (optional) (default to undefined)

const { status, data } = await apiInstance.getCameraVideoStatsApiV1VideosCamerasCameraIdVideoStatsGet(
    cameraId,
    dateFrom,
    dateTo
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cameraId** | [**number**] |  | defaults to undefined|
| **dateFrom** | [**string**] | Start date (YYYY-MM-DD) | (optional) defaults to undefined|
| **dateTo** | [**string**] | End date (YYYY-MM-DD) | (optional) defaults to undefined|


### Return type

**VideoStatsResponse**

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

# **getCameraVideosApiV1VideosCamerasCameraIdVideosGet**
> VideoListResponse getCameraVideosApiV1VideosCamerasCameraIdVideosGet()

Get videos for a specific camera  - **camera_id**: ID of the camera - **skip**: Number of records to skip (pagination) - **limit**: Maximum number of records to return (pagination) - **has_violations**: Optional filter for videos with violations - **processing_status**: Optional filter for processing status (pending, processing, completed, failed) - **date_from**: Optional start date filter (YYYY-MM-DD) - **date_to**: Optional end date filter (YYYY-MM-DD)  Returns list of videos with pagination

### Example

```typescript
import {
    VideosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VideosApi(configuration);

let cameraId: number; // (default to undefined)
let skip: number; //Number of records to skip (optional) (default to 0)
let limit: number; //Maximum number of records to return (optional) (default to 20)
let hasViolations: boolean; //Filter by videos with violations (optional) (default to undefined)
let processingStatus: string; //Filter by processing status (pending, processing, completed, failed) (optional) (default to undefined)
let dateFrom: string; //Start date filter (YYYY-MM-DD) (optional) (default to undefined)
let dateTo: string; //End date filter (YYYY-MM-DD) (optional) (default to undefined)

const { status, data } = await apiInstance.getCameraVideosApiV1VideosCamerasCameraIdVideosGet(
    cameraId,
    skip,
    limit,
    hasViolations,
    processingStatus,
    dateFrom,
    dateTo
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cameraId** | [**number**] |  | defaults to undefined|
| **skip** | [**number**] | Number of records to skip | (optional) defaults to 0|
| **limit** | [**number**] | Maximum number of records to return | (optional) defaults to 20|
| **hasViolations** | [**boolean**] | Filter by videos with violations | (optional) defaults to undefined|
| **processingStatus** | [**string**] | Filter by processing status (pending, processing, completed, failed) | (optional) defaults to undefined|
| **dateFrom** | [**string**] | Start date filter (YYYY-MM-DD) | (optional) defaults to undefined|
| **dateTo** | [**string**] | End date filter (YYYY-MM-DD) | (optional) defaults to undefined|


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

# **getVideoApiV1VideosVideoIdGet**
> VideoResponse getVideoApiV1VideosVideoIdGet()

Get details of a specific video  - **video_id**: ID of the video  Returns video details including metadata and processing status  Uses caching to improve performance for frequently accessed videos

### Example

```typescript
import {
    VideosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VideosApi(configuration);

let videoId: number; // (default to undefined)

const { status, data } = await apiInstance.getVideoApiV1VideosVideoIdGet(
    videoId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **videoId** | [**number**] |  | defaults to undefined|


### Return type

**VideoResponse**

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

# **uploadVideoApiV1VideosUploadPost**
> VideoUploadResponse uploadVideoApiV1VideosUploadPost()

Upload video to Cloudinary and save metadata to database  - **file**: Video file (mp4, avi, mov, max 100MB) - **camera_id**: ID of the camera that recorded the video - **recorded_at**: Optional timestamp when video was recorded  Returns video information  Security features: - Comprehensive file validation (extension, MIME type, size, malicious content) - Audit logging of upload attempts - Rate limiting (50 uploads per minute)

### Example

```typescript
import {
    VideosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VideosApi(configuration);

let file: File; //Video file to upload (default to undefined)
let cameraId: number; //Camera ID (default to undefined)
let recordedAt: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.uploadVideoApiV1VideosUploadPost(
    file,
    cameraId,
    recordedAt
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **file** | [**File**] | Video file to upload | defaults to undefined|
| **cameraId** | [**number**] | Camera ID | defaults to undefined|
| **recordedAt** | [**string**] |  | (optional) defaults to undefined|


### Return type

**VideoUploadResponse**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

