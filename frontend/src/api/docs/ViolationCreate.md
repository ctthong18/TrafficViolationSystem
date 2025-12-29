# ViolationCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**license_plate** | **string** |  | [default to undefined]
**vehicle_type** | **string** |  | [optional] [default to undefined]
**vehicle_color** | **string** |  | [optional] [default to undefined]
**vehicle_brand** | **string** |  | [optional] [default to undefined]
**violation_type** | **string** |  | [default to undefined]
**location_name** | **string** |  | [optional] [default to undefined]
**latitude** | [**Latitude**](Latitude.md) |  | [optional] [default to undefined]
**longitude** | [**Longitude**](Longitude.md) |  | [optional] [default to undefined]
**camera_id** | **string** |  | [optional] [default to undefined]
**detected_at** | **string** |  | [default to undefined]
**confidence_score** | **number** |  | [optional] [default to undefined]
**evidence_images** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**ai_metadata** | **{ [key: string]: any; }** |  | [optional] [default to undefined]

## Example

```typescript
import { ViolationCreate } from './api';

const instance: ViolationCreate = {
    license_plate,
    vehicle_type,
    vehicle_color,
    vehicle_brand,
    violation_type,
    location_name,
    latitude,
    longitude,
    camera_id,
    detected_at,
    confidence_score,
    evidence_images,
    ai_metadata,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
