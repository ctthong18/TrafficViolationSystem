/**
 * Citizen API Helper Functions
 * 
 * Provides utility functions to create pre-configured API instances
 * for citizen portal functionality.
 */

import axios from 'axios';
import {
    CitizenApi,
    ComplaintsApi,
    PaymentsApi,
    VehiclesApi,
    ViolationsApi,
    NotificationsApi,
    ComplaintResponse,
    ComplaintType,
} from './api';
import { Configuration } from './configuration';

/**
 * Interface for complaint creation data
 */
export interface ComplaintCreateData {
    title: string;
    description: string;
    complaint_type: ComplaintType | string;
    desired_resolution?: string;
    violation_id?: number;
    vehicle_id?: number;
    is_anonymous?: boolean;
}

/**
 * Create a new complaint
 * Uses axios directly since the generated API doesn't support request body properly
 */
export async function createComplaint(
    token: string | null | undefined,
    data: ComplaintCreateData
): Promise<ComplaintResponse> {
    const basePath = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const response = await axios.post<ComplaintResponse>(
        `${basePath}/api/v1/complaints/`,
        data,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : undefined,
            },
        }
    );

    return response.data;
}

/**
 * Creates a Configuration object with the given access token
 */
function createConfiguration(token: string | null | undefined): Configuration {
    return new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
        accessToken: token || undefined,
    });
}

/**
 * Get a configured CitizenApi instance
 */
export function getCitizenApi(token: string | null | undefined): CitizenApi {
    return new CitizenApi(createConfiguration(token));
}

/**
 * Get a configured ComplaintsApi instance
 */
export function getComplaintsApi(token: string | null | undefined): ComplaintsApi {
    return new ComplaintsApi(createConfiguration(token));
}

/**
 * Get a configured PaymentsApi instance
 */
export function getPaymentsApi(token: string | null | undefined): PaymentsApi {
    return new PaymentsApi(createConfiguration(token));
}

/**
 * Get a configured VehiclesApi instance
 */
export function getVehiclesApi(token: string | null | undefined): VehiclesApi {
    return new VehiclesApi(createConfiguration(token));
}

/**
 * Get a configured ViolationsApi instance
 */
export function getViolationsApi(token: string | null | undefined): ViolationsApi {
    return new ViolationsApi(createConfiguration(token));
}

/**
 * Get a configured NotificationsApi instance
 */
export function getNotificationsApi(token: string | null | undefined): NotificationsApi {
    return new NotificationsApi(createConfiguration(token));
}

// Re-export API classes for convenience
export {
    CitizenApi,
    ComplaintsApi,
    PaymentsApi,
    VehiclesApi,
    ViolationsApi,
    NotificationsApi,
    Configuration,
};
