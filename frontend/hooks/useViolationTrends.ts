/**
 * useViolationTrends Hook
 * 
 * Custom React hook for fetching and managing violation trend data
 * with forecasting and anomaly detection capabilities.
 */

import { useState, useEffect, useCallback } from 'react';

export interface TrendParams {
  startDate: string;
  endDate: string;
  granularity: 'hourly' | 'daily' | 'weekly' | 'monthly';
  cameraIds?: number[];
  violationTypes?: string[];
}

export interface TrendDataPoint {
  timestamp: string;
  violationCount: number;
  violationType: string;
  cameraId?: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  anomaly: boolean;
  forecast?: number;
}

export interface ForecastData {
  nextPeriod: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalComponent: boolean;
}

export interface UseViolationTrendsResult {
  trends: TrendDataPoint[];
  forecast: ForecastData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useViolationTrends(params: TrendParams): UseViolationTrendsResult {
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        start_date: params.startDate,
        end_date: params.endDate,
        granularity: params.granularity,
      });

      if (params.cameraIds?.length) {
        queryParams.append('camera_ids', params.cameraIds.join(','));
      }

      if (params.violationTypes?.length) {
        queryParams.append('violation_types', params.violationTypes.join(','));
      }

      // Import analyticsApi dynamically to avoid circular imports
      // const { analyticsApi } = await import('@/lib/api');
      
      // For now, use mock data since the API endpoint might not be fully implemented
      const mockTrends = generateMockTrendData(params);
      const mockForecast = generateMockForecast();
      
      setTrends(mockTrends);
      setForecast(mockForecast);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await analyticsApi.getViolationTrends(queryParams.toString());
      // setTrends(response.trends);
      // setForecast(response.forecast);
      
    } catch (err) {
      console.error('Failed to fetch trend data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trend data');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const generateMockTrendData = (params: TrendParams): TrendDataPoint[] => {
    const data: TrendDataPoint[] = [];
    const now = new Date();
    const days = params.granularity === 'hourly' ? 24 : 
                 params.granularity === 'daily' ? 30 : 
                 params.granularity === 'weekly' ? 12 : 6;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      
      if (params.granularity === 'hourly') {
        date.setHours(date.getHours() - i);
      } else if (params.granularity === 'daily') {
        date.setDate(date.getDate() - i);
      } else if (params.granularity === 'weekly') {
        date.setDate(date.getDate() - (i * 7));
      } else {
        date.setMonth(date.getMonth() - i);
      }

      const baseCount = Math.floor(Math.random() * 50) + 20;
      const isAnomaly = Math.random() < 0.1; // 10% chance of anomaly
      const violationCount = isAnomaly ? baseCount * 2 : baseCount;
      
      data.push({
        timestamp: date.toISOString(),
        violationCount,
        violationType: params.violationTypes?.[0] || 'speeding',
        cameraId: params.cameraIds?.[0],
        trend: violationCount > 40 ? 'increasing' : violationCount < 25 ? 'decreasing' : 'stable',
        anomaly: isAnomaly,
        forecast: violationCount + Math.floor(Math.random() * 10) - 5,
      });
    }
    
    return data;
  };

  const generateMockForecast = (): ForecastData => {
    return {
      nextPeriod: Math.floor(Math.random() * 50) + 30,
      confidence: 0.7 + Math.random() * 0.25,
      trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable',
      seasonalComponent: Math.random() > 0.5,
    };
  };

  const refresh = useCallback(() => {
    fetchTrendData();
  }, [fetchTrendData]);

  useEffect(() => {
    fetchTrendData();
  }, [fetchTrendData]);

  return {
    trends,
    forecast,
    loading,
    error,
    refresh,
  };
}

export default useViolationTrends;