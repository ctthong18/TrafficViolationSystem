# NotificationListResponse

Schema for paginated notification list

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**notifications** | [**Array&lt;NotificationResponse&gt;**](NotificationResponse.md) |  | [default to undefined]
**total** | **number** |  | [default to undefined]
**unread_count** | **number** |  | [default to undefined]
**page** | **number** |  | [default to undefined]
**size** | **number** |  | [default to undefined]

## Example

```typescript
import { NotificationListResponse } from './api';

const instance: NotificationListResponse = {
    notifications,
    total,
    unread_count,
    page,
    size,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
