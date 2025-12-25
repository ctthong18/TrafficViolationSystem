# DenunciationCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [default to undefined]
**description** | **string** |  | [default to undefined]
**denunciation_type** | [**DenunciationType**](DenunciationType.md) |  | [default to undefined]
**is_anonymous** | **boolean** |  | [optional] [default to true]
**contact_preference** | **string** |  | [optional] [default to undefined]
**can_contact** | **boolean** |  | [optional] [default to false]
**informant_name** | **string** |  | [optional] [default to undefined]
**informant_phone** | **string** |  | [optional] [default to undefined]
**informant_email** | **string** |  | [optional] [default to undefined]
**informant_identification** | **string** |  | [optional] [default to undefined]
**informant_address** | **string** |  | [optional] [default to undefined]
**accused_person_name** | **string** |  | [optional] [default to undefined]
**accused_person_position** | **string** |  | [optional] [default to undefined]
**accused_department** | **string** |  | [optional] [default to undefined]
**related_violation_id** | **number** |  | [optional] [default to undefined]
**related_user_id** | **number** |  | [optional] [default to undefined]
**evidence_urls** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**severity_level** | **string** |  | [optional] [default to 'MEDIUM']
**urgency_level** | **string** |  | [optional] [default to 'NORMAL']
**is_whistleblower** | **boolean** |  | [optional] [default to false]

## Example

```typescript
import { DenunciationCreate } from './api';

const instance: DenunciationCreate = {
    title,
    description,
    denunciation_type,
    is_anonymous,
    contact_preference,
    can_contact,
    informant_name,
    informant_phone,
    informant_email,
    informant_identification,
    informant_address,
    accused_person_name,
    accused_person_position,
    accused_department,
    related_violation_id,
    related_user_id,
    evidence_urls,
    severity_level,
    urgency_level,
    is_whistleblower,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
