# ViolationRulesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**applyRuleToViolationApiV1ViolationRulesRuleIdApplyViolationIdPost**](#applyruletoviolationapiv1violationrulesruleidapplyviolationidpost) | **POST** /api/v1/violation-rules/{rule_id}/apply/{violation_id} | Apply Rule To Violation|
|[**createViolationRuleApiV1ViolationRulesPost**](#createviolationruleapiv1violationrulespost) | **POST** /api/v1/violation-rules/ | Create Violation Rule|
|[**deleteViolationRuleApiV1ViolationRulesRuleIdDelete**](#deleteviolationruleapiv1violationrulesruleiddelete) | **DELETE** /api/v1/violation-rules/{rule_id} | Delete Violation Rule|
|[**getViolationRuleApiV1ViolationRulesRuleIdGet**](#getviolationruleapiv1violationrulesruleidget) | **GET** /api/v1/violation-rules/{rule_id} | Get Violation Rule|
|[**listViolationRulesApiV1ViolationRulesGet**](#listviolationrulesapiv1violationrulesget) | **GET** /api/v1/violation-rules/ | List Violation Rules|
|[**updateViolationRuleApiV1ViolationRulesRuleIdPut**](#updateviolationruleapiv1violationrulesruleidput) | **PUT** /api/v1/violation-rules/{rule_id} | Update Violation Rule|

# **applyRuleToViolationApiV1ViolationRulesRuleIdApplyViolationIdPost**
> any applyRuleToViolationApiV1ViolationRulesRuleIdApplyViolationIdPost()


### Example

```typescript
import {
    ViolationRulesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ViolationRulesApi(configuration);

let ruleId: number; // (default to undefined)
let violationId: number; // (default to undefined)

const { status, data } = await apiInstance.applyRuleToViolationApiV1ViolationRulesRuleIdApplyViolationIdPost(
    ruleId,
    violationId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **ruleId** | [**number**] |  | defaults to undefined|
| **violationId** | [**number**] |  | defaults to undefined|


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

# **createViolationRuleApiV1ViolationRulesPost**
> ViolationRuleResponse createViolationRuleApiV1ViolationRulesPost(violationRuleCreate)


### Example

```typescript
import {
    ViolationRulesApi,
    Configuration,
    ViolationRuleCreate
} from './api';

const configuration = new Configuration();
const apiInstance = new ViolationRulesApi(configuration);

let violationRuleCreate: ViolationRuleCreate; //

const { status, data } = await apiInstance.createViolationRuleApiV1ViolationRulesPost(
    violationRuleCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **violationRuleCreate** | **ViolationRuleCreate**|  | |


### Return type

**ViolationRuleResponse**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteViolationRuleApiV1ViolationRulesRuleIdDelete**
> any deleteViolationRuleApiV1ViolationRulesRuleIdDelete()


### Example

```typescript
import {
    ViolationRulesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ViolationRulesApi(configuration);

let ruleId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteViolationRuleApiV1ViolationRulesRuleIdDelete(
    ruleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **ruleId** | [**number**] |  | defaults to undefined|


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

# **getViolationRuleApiV1ViolationRulesRuleIdGet**
> ViolationRuleResponse getViolationRuleApiV1ViolationRulesRuleIdGet()


### Example

```typescript
import {
    ViolationRulesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ViolationRulesApi(configuration);

let ruleId: number; // (default to undefined)

const { status, data } = await apiInstance.getViolationRuleApiV1ViolationRulesRuleIdGet(
    ruleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **ruleId** | [**number**] |  | defaults to undefined|


### Return type

**ViolationRuleResponse**

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

# **listViolationRulesApiV1ViolationRulesGet**
> ViolationRuleListResponse listViolationRulesApiV1ViolationRulesGet()


### Example

```typescript
import {
    ViolationRulesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ViolationRulesApi(configuration);

let skip: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 50)
let search: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.listViolationRulesApiV1ViolationRulesGet(
    skip,
    limit,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **limit** | [**number**] |  | (optional) defaults to 50|
| **search** | [**string**] |  | (optional) defaults to undefined|


### Return type

**ViolationRuleListResponse**

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

# **updateViolationRuleApiV1ViolationRulesRuleIdPut**
> ViolationRuleResponse updateViolationRuleApiV1ViolationRulesRuleIdPut(violationRuleUpdate)


### Example

```typescript
import {
    ViolationRulesApi,
    Configuration,
    ViolationRuleUpdate
} from './api';

const configuration = new Configuration();
const apiInstance = new ViolationRulesApi(configuration);

let ruleId: number; // (default to undefined)
let violationRuleUpdate: ViolationRuleUpdate; //

const { status, data } = await apiInstance.updateViolationRuleApiV1ViolationRulesRuleIdPut(
    ruleId,
    violationRuleUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **violationRuleUpdate** | **ViolationRuleUpdate**|  | |
| **ruleId** | [**number**] |  | defaults to undefined|


### Return type

**ViolationRuleResponse**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

