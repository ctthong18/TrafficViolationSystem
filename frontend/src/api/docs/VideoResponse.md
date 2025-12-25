# VideoResponse

Response for video details

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [default to undefined]
**camera_id** | **number** |  | [default to undefined]
**cloudinary_public_id** | **string** |  | [default to undefined]
**cloudinary_url** | **string** |  | [default to undefined]
**thumbnail_url** | **string** |  | [optional] [default to undefined]
**duration** | **number** |  | [optional] [default to undefined]
**file_size** | **number** |  | [optional] [default to undefined]
**format** | **string** |  | [optional] [default to undefined]
**uploaded_by** | **number** |  | [default to undefined]
**uploaded_at** | **string** |  | [default to undefined]
**processed_at** | **string** |  | [optional] [default to undefined]
**processing_status** | [**ProcessingStatus**](ProcessingStatus.md) |  | [default to undefined]
**has_violations** | **boolean** |  | [default to undefined]
**violation_count** | **number** |  | [default to undefined]

## Example

```typescript
import { VideoResponse } from './api';

const instance: VideoResponse = {
    id,
    camera_id,
    cloudinary_public_id,
    cloudinary_url,
    thumbnail_url,
    duration,
    file_size,
    format,
    uploaded_by,
    uploaded_at,
    processed_at,
    processing_status,
    has_violations,
    violation_count,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
