# ViolationResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**license_plate** | **string** |  | [default to undefined]
**vehicle_type** | **string** |  | [optional] [default to undefined]
**vehicle_color** | **string** |  | [optional] [default to undefined]
**vehicle_brand** | **string** |  | [optional] [default to undefined]
**violation_type** | **string** |  | [default to undefined]
**location_name** | **string** |  | [optional] [default to undefined]
**latitude** | **string** |  | [optional] [default to undefined]
**longitude** | **string** |  | [optional] [default to undefined]
**camera_id** | **string** |  | [optional] [default to undefined]
**id** | **number** |  | [default to undefined]
**detected_at** | **string** |  | [default to undefined]
**confidence_score** | **number** |  | [optional] [default to undefined]
**status** | [**ViolationStatus**](ViolationStatus.md) |  | [default to undefined]
**priority** | **string** |  | [default to undefined]
**reviewed_by** | **number** |  | [default to undefined]
**reviewed_at** | **string** |  | [default to undefined]
**review_notes** | **string** |  | [default to undefined]
**evidence_images** | **Array&lt;string&gt;** |  | [default to undefined]
**evidence_gif** | **string** |  | [default to undefined]
**ai_metadata** | **{ [key: string]: any; }** |  | [default to undefined]
**violation_description** | **string** |  | [optional] [default to undefined]
**fine_amount** | **string** |  | [optional] [default to undefined]
**points_deducted** | **number** |  | [optional] [default to undefined]
**legal_reference** | **string** |  | [optional] [default to undefined]
**video_id** | **number** |  | [optional] [default to undefined]
**video_evidence** | [**VideoEvidenceInfo**](VideoEvidenceInfo.md) |  | [optional] [default to undefined]
**created_at** | **string** |  | [default to undefined]
**updated_at** | **string** |  | [default to undefined]

## Example

```typescript
import { ViolationResponse } from './api';

const instance: ViolationResponse = {
    license_plate,
    vehicle_type,
    vehicle_color,
    vehicle_brand,
    violation_type,
    location_name,
    latitude,
    longitude,
    camera_id,
    id,
    detected_at,
    confidence_score,
    status,
    priority,
    reviewed_by,
    reviewed_at,
    review_notes,
    evidence_images,
    evidence_gif,
    ai_metadata,
    violation_description,
    fine_amount,
    points_deducted,
    legal_reference,
    video_id,
    video_evidence,
    created_at,
    updated_at,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
