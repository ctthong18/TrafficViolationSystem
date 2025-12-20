/**
 * useAnalyticsDashboard Hook
 * 
 * Custom React hook for fetching and managing analytics dashboard metrics
 * with time range filtering, camera filtering, and refresh functionality.
 */

import { useState, useEffect, useCallback } from 'react';

export interface TimeRange {
  start: string;
  end: string;
}

export interface DashboardMetrics {
  totalViolations: number;
  totalVehicles: number;
  activeCameras: number;
  totalCameras: number;
  averageSpeed: number;
  violationsByType: Record<string, number>;
  violationsByHour: Array<{ hour: string; count: number }>;
  topViolationLocations: Array<{
    locationId: string;
    locationName: string;
    violationCount: number;
    cameraIds: number[];
  }>;
  systemHealth: {
    overallStatus: 'healthy' | 'warning' | 'critical';
    modelAccuracy: number;
    processingLatency: number;
    errorRate: number;
  };
  trends: {
    violationTrend: 'increasing' | 'decreasing' | 'stable';
    violationChange: number; // percentage change
    vehicleTrend: 'increasing' | 'decreasing' | 'stable';
    vehicleChange: number; // percentage change
  };
}

export interface UseAnalyticsDashboardResult {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAnalyticsDashboard(
  timeRange: TimeRange,
  cameraFilter?: number[]
): UseAnalyticsDashboardResult {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        start_time: timeRange.start,
        end_time: timeRange.end,
      });

      if (cameraFilter?.length) {
        queryParams.append('camera_ids', cameraFilter.join(','));
      }

      // Import analyticsApi dynamically to avoid circular imports
      // const { analyticsApi } = await import('@/lib/api');
      
      // For now, use mock data since the API endpoint might not be fully implemented
      const mockMetrics = generateMockDashboardMetrics(cameraFilter);
      setMetrics(mockMetrics);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await analyticsApi.getDashboardMetrics(queryParams.toString());
      // setMetrics(response.metrics);
      
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, [timeRange, cameraFilter]);

  const generateMockDashboardMetrics = (cameraFilter?: number[]): DashboardMetrics => {
    const totalCameras = cameraFilter?.length || 25;
    const activeCameras = Math.floor(totalCameras * 0.92); // 92% uptime
    const totalViolations = Math.floor(Math.random() * 500) + 200;
    const totalVehicles = Math.floor(Math.random() * 2000) + 1000;
    
    return {
      totalViolations,
      totalVehicles,
      activeCameras,
      totalCameras,
      averageSpeed: Math.round((Math.random() * 20 + 40) * 100) / 100, // 40-60 km/h
      violationsByType: {
        speeding: Math.floor(totalViolations * 0.4),
        red_light: Math.floor(totalViolations * 0.25),
        wrong_lane: Math.floor(totalViolations * 0.15),
        illegal_parking: Math.floor(totalViolations * 0.12),
        no_helmet: Math.floor(totalViolations * 0.08),
      },
      violationsByHour: generateHourlyData(),
      topViolationLocations: [
        {
          locationId: 'loc_1',
          locationName: 'Hoan Kiem District Center',
          violationCount: Math.floor(totalViolations * 0.2),
          cameraIds: [1, 2],
        },
        {
          locationId: 'loc_2',
          locationName: 'Ba Dinh Square Area',
          violationCount: Math.floor(totalViolations * 0.15),
          cameraIds: [3, 4],
        },
        {
          locationId: 'loc_3',
          locationName: 'Dong Da Commercial Zone',
          violationCount: Math.floor(totalViolations * 0.12),
          cameraIds: [5],
        },
        {
          locationId: 'loc_4',
          locationName: 'Hai Ba Trung Junction',
          violationCount: Math.floor(totalViolations * 0.1),
          cameraIds: [6, 7],
        },
        {
          locationId: 'loc_5',
          locationName: 'Cau Giay Tech Hub',
          violationCount: Math.floor(totalViolations * 0.08),
          cameraIds: [8, 9, 10],
        },
      ],
      systemHealth: {
        overallStatus: activeCameras / totalCameras > 0.9 ? 'healthy' : 
                     activeCameras / totalCameras > 0.8 ? 'warning' : 'critical',
        modelAccuracy: Math.round((Math.random() * 10 + 85) * 100) / 100, // 85-95%
        processingLatency: Math.round((Math.random() * 30 + 20) * 100) / 100, // 20-50ms
        errorRate: Math.round((Math.random() * 3) * 100) / 100, // 0-3%
      },
      trends: {
        violationTrend: totalViolations > 350 ? 'increasing' : 
                       totalViolations < 250 ? 'decreasing' : 'stable',
        violationChange: Math.round((Math.random() * 30 - 15) * 100) / 100, // -15% to +15%
        vehicleTrend: totalVehicles > 1500 ? 'increasing' : 
                     totalVehicles < 1200 ? 'decreasing' : 'stable',
        vehicleChange: Math.round((Math.random() * 20 - 10) * 100) / 100, // -10% to +10%
      },
    };
  };

  const generateHourlyData = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0') + ':00';
      // Peak hours: 7-9 AM and 5-7 PM
      const isPeakHour = (i >= 7 && i <= 9) || (i >= 17 && i <= 19);
      const baseCount = isPeakHour ? 20 : 8;
      const count = Math.floor(Math.random() * 10) + baseCount;
      
      hours.push({ hour, count });
    }
    return hours;
  };

  const refresh = useCallback(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh,
  };
}

export default useAnalyticsDashboard;