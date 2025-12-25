# VideoStatsResponse

Response for video statistics

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**camera_id** | **number** |  | [default to undefined]
**total_videos** | **number** |  | [default to undefined]
**total_duration** | **number** |  | [default to undefined]
**total_violations** | **number** |  | [default to undefined]
**videos_with_violations** | **number** |  | [default to undefined]
**avg_duration** | **number** |  | [default to undefined]
**stats_by_date** | [**Array&lt;VideoStatsByDate&gt;**](VideoStatsByDate.md) |  | [default to undefined]

## Example

```typescript
import { VideoStatsResponse } from './api';

const instance: VideoStatsResponse = {
    camera_id,
    total_videos,
    total_duration,
    total_violations,
    videos_with_violations,
    avg_duration,
    stats_by_date,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
