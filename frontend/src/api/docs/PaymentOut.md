# PaymentOut


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**amount** | **string** |  | [default to undefined]
**payment_method** | [**PaymentMethod**](PaymentMethod.md) |  | [default to undefined]
**payment_type** | [**PaymentType**](PaymentType.md) |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**id** | **number** |  | [default to undefined]
**user_id** | **number** |  | [default to undefined]
**violation_id** | **number** |  | [default to undefined]
**status** | [**PaymentStatus**](PaymentStatus.md) |  | [default to undefined]
**created_at** | **string** |  | [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]
**due_date** | **string** |  | [optional] [default to undefined]
**paid_at** | **string** |  | [optional] [default to undefined]
**late_fee** | **string** |  | [optional] [default to undefined]
**total_amount** | **string** |  | [optional] [default to undefined]
**qr_transaction_id** | **string** |  | [optional] [default to undefined]
**qr_expiry_time** | **string** |  | [optional] [default to undefined]
**bank_account_number** | **string** |  | [optional] [default to undefined]
**bank_name** | **string** |  | [optional] [default to undefined]
**transfer_content** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { PaymentOut } from './api';

const instance: PaymentOut = {
    amount,
    payment_method,
    payment_type,
    description,
    id,
    user_id,
    violation_id,
    status,
    created_at,
    updated_at,
    due_date,
    paid_at,
    late_fee,
    total_amount,
    qr_transaction_id,
    qr_expiry_time,
    bank_account_number,
    bank_name,
    transfer_content,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
