# NotificationResponse

Schema for notification response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [default to undefined]
**notification_code** | **string** |  | [default to undefined]
**recipient_id** | **number** |  | [default to undefined]
**recipient_name** | **string** |  | [optional] [default to undefined]
**title** | **string** |  | [default to undefined]
**message** | **string** |  | [default to undefined]
**short_message** | **string** |  | [optional] [default to undefined]
**channel** | [**NotificationChannel**](NotificationChannel.md) |  | [default to undefined]
**status** | [**NotificationStatus**](NotificationStatus.md) |  | [default to undefined]
**priority** | **string** |  | [default to undefined]
**violation_id** | **number** |  | [optional] [default to undefined]
**payment_id** | **number** |  | [optional] [default to undefined]
**complaint_id** | **number** |  | [optional] [default to undefined]
**sent_at** | **string** |  | [optional] [default to undefined]
**read_at** | **string** |  | [optional] [default to undefined]
**created_at** | **string** |  | [default to undefined]
**updated_at** | **string** |  | [default to undefined]
**template_variables** | **{ [key: string]: any; }** |  | [optional] [default to undefined]

## Example

```typescript
import { NotificationResponse } from './api';

const instance: NotificationResponse = {
    id,
    notification_code,
    recipient_id,
    recipient_name,
    title,
    message,
    short_message,
    channel,
    status,
    priority,
    violation_id,
    payment_id,
    complaint_id,
    sent_at,
    read_at,
    created_at,
    updated_at,
    template_variables,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
