# VideoUploadResponse

Response for video upload

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**video_id** | **number** |  | [default to undefined]
**cloudinary_url** | **string** |  | [default to undefined]
**thumbnail_url** | **string** |  | [optional] [default to undefined]
**processing_job_id** | **number** |  | [optional] [default to undefined]
**status** | [**ProcessingStatus**](ProcessingStatus.md) |  | [default to undefined]

## Example

```typescript
import { VideoUploadResponse } from './api';

const instance: VideoUploadResponse = {
    video_id,
    cloudinary_url,
    thumbnail_url,
    processing_job_id,
    status,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
