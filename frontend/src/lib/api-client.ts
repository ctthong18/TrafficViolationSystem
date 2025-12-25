import { Configuration } from "@/api/configuration";
import {
  AdminApi,
  CitizenApi,
  OfficerApi,
  ViolationsApi,
  PaymentsApi,
  UsersApi,
  ActivitiesApi,
  StatisticsApi,
  AuthenticationApi,
} from "@/api";

// Get the base URL from environment variable or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create a configuration instance
const createApiConfiguration = () => {
  // Get token from localStorage if available
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("access_token");

    // Debug logging
    if (!token) {
      console.warn("API Client: No access token found in localStorage");
    } else {
      console.log("API Client: Token found, length:", token.length);
    }
  }

  return new Configuration({
    basePath: API_BASE_URL,
    accessToken: token ? token : undefined,
  });
};

// Create API instances
export const createAdminApi = () => new AdminApi(createApiConfiguration());
export const createCitizenApi = () => new CitizenApi(createApiConfiguration());
export const createOfficerApi = () => new OfficerApi(createApiConfiguration());
export const createViolationsApi = () =>
  new ViolationsApi(createApiConfiguration());
export const createPaymentsApi = () =>
  new PaymentsApi(createApiConfiguration());
export const createUsersApi = () => new UsersApi(createApiConfiguration());
export const createActivitiesApi = () =>
  new ActivitiesApi(createApiConfiguration());
export const createStatisticsApi = () =>
  new StatisticsApi(createApiConfiguration());
export const createAuthenticationApi = () =>
  new AuthenticationApi(createApiConfiguration());

// Export a default API client object
export const apiClient = {
  admin: createAdminApi,
  citizen: createCitizenApi,
  officer: createOfficerApi,
  violations: createViolationsApi,
  payments: createPaymentsApi,
  users: createUsersApi,
  activities: createActivitiesApi,
  statistics: createStatisticsApi,
  auth: createAuthenticationApi,
};
