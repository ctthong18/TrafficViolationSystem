# AppealResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**appeal_reason** | **string** |  | [default to undefined]
**new_evidence_urls** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**id** | **number** |  | [default to undefined]
**appeal_code** | **string** |  | [default to undefined]
**complaint_id** | **number** |  | [default to undefined]
**status** | [**AppealStatus**](AppealStatus.md) |  | [default to undefined]
**reviewed_by** | **number** |  | [default to undefined]
**reviewed_at** | **string** |  | [default to undefined]
**review_notes** | **string** |  | [default to undefined]
**created_at** | **string** |  | [default to undefined]

## Example

```typescript
import { AppealResponse } from './api';

const instance: AppealResponse = {
    appeal_reason,
    new_evidence_urls,
    id,
    appeal_code,
    complaint_id,
    status,
    reviewed_by,
    reviewed_at,
    review_notes,
    created_at,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
