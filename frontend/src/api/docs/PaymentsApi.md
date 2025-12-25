# PaymentsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createFinePaymentApiV1PaymentsFinesViolationIdPost**](#createfinepaymentapiv1paymentsfinesviolationidpost) | **POST** /api/v1/payments/fines/{violation_id} | Create Fine Payment|
|[**createQrPaymentApiV1PaymentsPaymentsPaymentIdQrPost**](#createqrpaymentapiv1paymentspaymentspaymentidqrpost) | **POST** /api/v1/payments/payments/{payment_id}/qr | Create Qr Payment|
|[**depositToWalletApiV1PaymentsWalletDepositPost**](#deposittowalletapiv1paymentswalletdepositpost) | **POST** /api/v1/payments/wallet/deposit | Deposit To Wallet|
|[**getMyPaymentsApiV1PaymentsMyPaymentsGet**](#getmypaymentsapiv1paymentsmypaymentsget) | **GET** /api/v1/payments/my-payments | Get My Payments|
|[**getPaymentStatusApiV1PaymentsPaymentsPaymentIdStatusGet**](#getpaymentstatusapiv1paymentspaymentspaymentidstatusget) | **GET** /api/v1/payments/payments/{payment_id}/status | Get Payment Status|
|[**getReceiptApiV1PaymentsPaymentsPaymentIdReceiptGet**](#getreceiptapiv1paymentspaymentspaymentidreceiptget) | **GET** /api/v1/payments/payments/{payment_id}/receipt | Get Receipt|
|[**getWalletSummaryApiV1PaymentsWalletSummaryGet**](#getwalletsummaryapiv1paymentswalletsummaryget) | **GET** /api/v1/payments/wallet/summary | Get Wallet Summary|
|[**payFineFromWalletApiV1PaymentsFinesPaymentIdPayFromWalletPost**](#payfinefromwalletapiv1paymentsfinespaymentidpayfromwalletpost) | **POST** /api/v1/payments/fines/{payment_id}/pay-from-wallet | Pay Fine From Wallet|

# **createFinePaymentApiV1PaymentsFinesViolationIdPost**
> PaymentOut createFinePaymentApiV1PaymentsFinesViolationIdPost()


### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let violationId: number; // (default to undefined)

const { status, data } = await apiInstance.createFinePaymentApiV1PaymentsFinesViolationIdPost(
    violationId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **violationId** | [**number**] |  | defaults to undefined|


### Return type

**PaymentOut**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createQrPaymentApiV1PaymentsPaymentsPaymentIdQrPost**
> any createQrPaymentApiV1PaymentsPaymentsPaymentIdQrPost()


### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let paymentId: number; // (default to undefined)

const { status, data } = await apiInstance.createQrPaymentApiV1PaymentsPaymentsPaymentIdQrPost(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**number**] |  | defaults to undefined|


### Return type

**any**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **depositToWalletApiV1PaymentsWalletDepositPost**
> any depositToWalletApiV1PaymentsWalletDepositPost()


### Example

```typescript
import {
    PaymentsApi,
    Configuration,
    Amount
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let amount: Amount; //Số tiền nạp > 0 (default to undefined)
let paymentMethod: string; //bank_transfer, credit_card, e_wallet (default to undefined)

const { status, data } = await apiInstance.depositToWalletApiV1PaymentsWalletDepositPost(
    amount,
    paymentMethod
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **amount** | **Amount** | Số tiền nạp &gt; 0 | defaults to undefined|
| **paymentMethod** | [**string**] | bank_transfer, credit_card, e_wallet | defaults to undefined|


### Return type

**any**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyPaymentsApiV1PaymentsMyPaymentsGet**
> any getMyPaymentsApiV1PaymentsMyPaymentsGet()


### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let paymentType: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getMyPaymentsApiV1PaymentsMyPaymentsGet(
    paymentType
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentType** | [**string**] |  | (optional) defaults to undefined|


### Return type

**any**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPaymentStatusApiV1PaymentsPaymentsPaymentIdStatusGet**
> any getPaymentStatusApiV1PaymentsPaymentsPaymentIdStatusGet()


### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let paymentId: number; // (default to undefined)

const { status, data } = await apiInstance.getPaymentStatusApiV1PaymentsPaymentsPaymentIdStatusGet(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**number**] |  | defaults to undefined|


### Return type

**any**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getReceiptApiV1PaymentsPaymentsPaymentIdReceiptGet**
> any getReceiptApiV1PaymentsPaymentsPaymentIdReceiptGet()


### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let paymentId: number; // (default to undefined)

const { status, data } = await apiInstance.getReceiptApiV1PaymentsPaymentsPaymentIdReceiptGet(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**number**] |  | defaults to undefined|


### Return type

**any**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getWalletSummaryApiV1PaymentsWalletSummaryGet**
> any getWalletSummaryApiV1PaymentsWalletSummaryGet()


### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

const { status, data } = await apiInstance.getWalletSummaryApiV1PaymentsWalletSummaryGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**any**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **payFineFromWalletApiV1PaymentsFinesPaymentIdPayFromWalletPost**
> any payFineFromWalletApiV1PaymentsFinesPaymentIdPayFromWalletPost()


### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let paymentId: number; // (default to undefined)

const { status, data } = await apiInstance.payFineFromWalletApiV1PaymentsFinesPaymentIdPayFromWalletPost(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**number**] |  | defaults to undefined|


### Return type

**any**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

