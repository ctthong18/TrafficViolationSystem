# AdminApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createOfficerAccountApiV1AdminUsersOfficersPost**](#createofficeraccountapiv1adminusersofficerspost) | **POST** /api/v1/admin/users/officers | Create Officer Account|
|[**createUserApiV1AdminUsersPost**](#createuserapiv1adminuserspost) | **POST** /api/v1/admin/users | Create User|
|[**getAdminDashboardApiV1AdminDashboardStatsGet**](#getadmindashboardapiv1admindashboardstatsget) | **GET** /api/v1/admin/dashboard/stats | Get Admin Dashboard|
|[**getAllUsersApiV1AdminUsersGet**](#getallusersapiv1adminusersget) | **GET** /api/v1/admin/users | Get All Users|

# **createOfficerAccountApiV1AdminUsersOfficersPost**
> UserResponse createOfficerAccountApiV1AdminUsersOfficersPost(userCreate)


### Example

```typescript
import {
    AdminApi,
    Configuration,
    UserCreate
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let userCreate: UserCreate; //

const { status, data } = await apiInstance.createOfficerAccountApiV1AdminUsersOfficersPost(
    userCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userCreate** | **UserCreate**|  | |


### Return type

**UserResponse**

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

# **createUserApiV1AdminUsersPost**
> UserResponse createUserApiV1AdminUsersPost(userCreate)


### Example

```typescript
import {
    AdminApi,
    Configuration,
    UserCreate
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let userCreate: UserCreate; //

const { status, data } = await apiInstance.createUserApiV1AdminUsersPost(
    userCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userCreate** | **UserCreate**|  | |


### Return type

**UserResponse**

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

# **getAdminDashboardApiV1AdminDashboardStatsGet**
> any getAdminDashboardApiV1AdminDashboardStatsGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.getAdminDashboardApiV1AdminDashboardStatsGet();
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

# **getAllUsersApiV1AdminUsersGet**
> UserListResponse getAllUsersApiV1AdminUsersGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let skip: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 100)
let role: Role; // (optional) (default to undefined)
let isActive: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.getAllUsersApiV1AdminUsersGet(
    skip,
    limit,
    role,
    isActive
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **limit** | [**number**] |  | (optional) defaults to 100|
| **role** | **Role** |  | (optional) defaults to undefined|
| **isActive** | [**boolean**] |  | (optional) defaults to undefined|


### Return type

**UserListResponse**

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

