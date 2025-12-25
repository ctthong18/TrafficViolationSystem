# CameraResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**camera_id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**location_name** | **string** |  | [optional] [default to undefined]
**latitude** | **number** |  | [optional] [default to undefined]
**longitude** | **number** |  | [optional] [default to undefined]
**address** | **string** |  | [optional] [default to undefined]
**camera_type** | **string** |  | [optional] [default to undefined]
**resolution** | **string** |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**enabled_detections** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**ai_model_version** | **string** |  | [optional] [default to undefined]
**confidence_threshold** | **number** |  | [optional] [default to undefined]
**last_maintenance** | **string** |  | [optional] [default to undefined]
**next_maintenance** | **string** |  | [optional] [default to undefined]
**id** | **number** |  | [default to undefined]
**violations_today** | **number** |  | [optional] [default to 0]
**last_violation_at** | **string** |  | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CameraResponse } from './api';

const instance: CameraResponse = {
    camera_id,
    name,
    location_name,
    latitude,
    longitude,
    address,
    camera_type,
    resolution,
    status,
    enabled_detections,
    ai_model_version,
    confidence_threshold,
    last_maintenance,
    next_maintenance,
    id,
    violations_today,
    last_violation_at,
    created_at,
    updated_at,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
