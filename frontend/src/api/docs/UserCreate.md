# UserCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**username** | **string** |  | [default to undefined]
**email** | **string** |  | [default to undefined]
**full_name** | **string** |  | [default to undefined]
**identification_number** | **string** |  | [default to undefined]
**phone_number** | **string** |  | [optional] [default to undefined]
**department** | **string** |  | [optional] [default to undefined]
**badge_number** | **string** |  | [optional] [default to undefined]
**password** | **string** |  | [default to undefined]
**role** | [**Role**](Role.md) |  | [optional] [default to undefined]

## Example

```typescript
import { UserCreate } from './api';

const instance: UserCreate = {
    username,
    email,
    full_name,
    identification_number,
    phone_number,
    department,
    badge_number,
    password,
    role,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
