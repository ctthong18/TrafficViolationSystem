# DenunciationResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [default to undefined]
**description** | **string** |  | [default to undefined]
**denunciation_type** | [**DenunciationType**](DenunciationType.md) |  | [default to undefined]
**is_anonymous** | **boolean** |  | [optional] [default to true]
**contact_preference** | **string** |  | [optional] [default to undefined]
**can_contact** | **boolean** |  | [optional] [default to false]
**id** | **number** |  | [default to undefined]
**denunciation_code** | **string** |  | [default to undefined]
**status** | [**DenunciationStatus**](DenunciationStatus.md) |  | [default to undefined]
**severity_level** | **string** |  | [default to undefined]
**urgency_level** | **string** |  | [default to undefined]
**informant_name** | **string** |  | [default to undefined]
**informant_phone** | **string** |  | [default to undefined]
**informant_email** | **string** |  | [default to undefined]
**accused_person_name** | **string** |  | [default to undefined]
**accused_person_position** | **string** |  | [default to undefined]
**accused_department** | **string** |  | [default to undefined]
**related_violation_id** | **number** |  | [default to undefined]
**related_user_id** | **number** |  | [default to undefined]
**assigned_investigator_id** | **number** |  | [default to undefined]
**assigned_at** | **string** |  | [default to undefined]
**resolved_at** | **string** |  | [default to undefined]
**investigation_notes** | **string** |  | [default to undefined]
**resolution** | **string** |  | [default to undefined]
**security_level** | **string** |  | [default to undefined]
**is_whistleblower** | **boolean** |  | [default to undefined]
**transferred_to** | **string** |  | [default to undefined]
**transfer_reason** | **string** |  | [default to undefined]
**transferred_at** | **string** |  | [default to undefined]
**created_at** | **string** |  | [default to undefined]
**updated_at** | **string** |  | [default to undefined]

## Example

```typescript
import { DenunciationResponse } from './api';

const instance: DenunciationResponse = {
    title,
    description,
    denunciation_type,
    is_anonymous,
    contact_preference,
    can_contact,
    id,
    denunciation_code,
    status,
    severity_level,
    urgency_level,
    informant_name,
    informant_phone,
    informant_email,
    accused_person_name,
    accused_person_position,
    accused_department,
    related_violation_id,
    related_user_id,
    assigned_investigator_id,
    assigned_at,
    resolved_at,
    investigation_notes,
    resolution,
    security_level,
    is_whistleblower,
    transferred_to,
    transfer_reason,
    transferred_at,
    created_at,
    updated_at,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
