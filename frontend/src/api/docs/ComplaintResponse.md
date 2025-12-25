# ComplaintResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [default to undefined]
**description** | **string** |  | [default to undefined]
**complaint_type** | [**ComplaintType**](ComplaintType.md) |  | [default to undefined]
**desired_resolution** | **string** |  | [optional] [default to undefined]
**is_anonymous** | **boolean** |  | [optional] [default to false]
**id** | **number** |  | [default to undefined]
**complaint_code** | **string** |  | [default to undefined]
**status** | [**ComplaintStatus**](ComplaintStatus.md) |  | [default to undefined]
**priority** | **string** |  | [default to undefined]
**complainant_name** | **string** |  | [default to undefined]
**complainant_phone** | **string** |  | [default to undefined]
**complainant_email** | **string** |  | [default to undefined]
**violation_id** | **number** |  | [default to undefined]
**vehicle_id** | **number** |  | [default to undefined]
**assigned_officer_id** | **number** |  | [default to undefined]
**assigned_at** | **string** |  | [default to undefined]
**resolved_at** | **string** |  | [default to undefined]
**user_rating** | **number** |  | [default to undefined]
**user_feedback** | **string** |  | [default to undefined]
**created_at** | **string** |  | [default to undefined]
**updated_at** | **string** |  | [default to undefined]

## Example

```typescript
import { ComplaintResponse } from './api';

const instance: ComplaintResponse = {
    title,
    description,
    complaint_type,
    desired_resolution,
    is_anonymous,
    id,
    complaint_code,
    status,
    priority,
    complainant_name,
    complainant_phone,
    complainant_email,
    violation_id,
    vehicle_id,
    assigned_officer_id,
    assigned_at,
    resolved_at,
    user_rating,
    user_feedback,
    created_at,
    updated_at,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
