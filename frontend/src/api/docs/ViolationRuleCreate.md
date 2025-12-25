# ViolationRuleCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**code** | **string** |  | [default to undefined]
**description** | **string** |  | [default to undefined]
**law_reference** | **string** |  | [optional] [default to undefined]
**fine_min_car** | [**FineMinCar**](FineMinCar.md) |  | [optional] [default to undefined]
**fine_max_car** | [**FineMaxCar**](FineMaxCar.md) |  | [optional] [default to undefined]
**points_car** | **number** |  | [optional] [default to undefined]
**fine_min_bike** | [**FineMinBike**](FineMinBike.md) |  | [optional] [default to undefined]
**fine_max_bike** | [**FineMaxBike**](FineMaxBike.md) |  | [optional] [default to undefined]
**points_bike** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { ViolationRuleCreate } from './api';

const instance: ViolationRuleCreate = {
    code,
    description,
    law_reference,
    fine_min_car,
    fine_max_car,
    points_car,
    fine_min_bike,
    fine_max_bike,
    points_bike,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
