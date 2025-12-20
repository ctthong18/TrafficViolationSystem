/**
 * useHotspots Hook
 * 
 * Custom React hook for fetching and managing hotspot data
 * with geographic violation density and risk analysis.
 */

import { useState, useEffect, useCallback } from 'react';

export interface TimeRange {
  start: string;
  end: string;
}

export interface HotspotData {
  locationId: string;
  locationName: string;
  coordinates: [number, number]; // [lat, lng]
  violationDensity: number;
  riskScore: number;
  primaryViolationTypes: string[];
  peakHours: string[];
  cameraIds: number[];
  violationCount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface UseHotspotsResult {
  hotspots: HotspotData[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useHotspots(
  timeRange: TimeRange, 
  violationType?: string
): UseHotspotsResult {
  const [hotspots, setHotspots] = useState<HotspotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotspotData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        start_time: timeRange.start,
        end_time: timeRange.end,
      });

      if (violationType) {
        queryParams.append('violation_type', violationType);
      }

      // Import analyticsApi dynamically to avoid circular imports
      // const { analyticsApi } = await import('@/lib/api');
      
      // For now, use mock data since the API endpoint might not be fully implemented
      const mockHotspots = generateMockHotspots();
      setHotspots(mockHotspots);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await analyticsApi.getHotspots(queryParams.toString());
      // setHotspots(response.hotspots);
      
    } catch (err) {
      console.error('Failed to fetch hotspot data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch hotspot data');
    } finally {
      setLoading(false);
    }
  }, [timeRange, violationType]);

  const generateMockHotspots = (): HotspotData[] => {
    const locations = [
      { 
        id: 'hotspot_1',
        name: 'Hoan Kiem District Center', 
        coords: [21.0285, 105.8542] as [number, number],
        cameras: [1, 2]
      },
      { 
        id: 'hotspot_2',
        name: 'Ba Dinh Square Area', 
        coords: [21.0368, 105.8340] as [number, number],
        cameras: [3, 4]
      },
      { 
        id: 'hotspot_3',
        name: 'Dong Da Commercial Zone', 
        coords: [21.0136, 105.8270] as [number, number],
        cameras: [5]
      },
      { 
        id: 'hotspot_4',
        name: 'Hai Ba Trung Junction', 
        coords: [21.0122, 105.8580] as [number, number],
        cameras: [6, 7]
      },
      { 
        id: 'hotspot_5',
        name: 'Cau Giay Tech Hub', 
        coords: [21.0285, 105.7938] as [number, number],
        cameras: [8, 9, 10]
      },
    ];

    return locations.map((location) => {
      const violationCount = Math.floor(Math.random() * 150) + 50;
      const density = Math.floor(Math.random() * 100) + 20;
      const riskScore = Math.random() * 0.4 + 0.6; // 0.6 - 1.0
      
      return {
        locationId: location.id,
        locationName: location.name,
        coordinates: location.coords,
        violationDensity: density,
        riskScore: Math.round(riskScore * 100) / 100,
        primaryViolationTypes: generateViolationTypes(violationType),
        peakHours: generatePeakHours(),
        cameraIds: location.cameras,
        violationCount,
        trend: violationCount > 100 ? 'increasing' : violationCount < 70 ? 'decreasing' : 'stable',
      };
    });
  };

  const generateViolationTypes = (filterType?: string): string[] => {
    const allTypes = ['speeding', 'red_light', 'wrong_lane', 'illegal_parking', 'no_helmet'];
    
    if (filterType) {
      return [filterType];
    }
    
    // Return 1-3 random violation types
    const count = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...allTypes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const generatePeakHours = (): string[] => {
    const possibleHours = [
      '07:00-08:00',
      '08:00-09:00', 
      '12:00-13:00',
      '17:00-18:00',
      '18:00-19:00',
      '22:00-23:00'
    ];
    
    // Return 1-3 peak hours
    const count = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...possibleHours].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const refresh = useCallback(() => {
    fetchHotspotData();
  }, [fetchHotspotData]);

  useEffect(() => {
    fetchHotspotData();
  }, [fetchHotspotData]);

  return {
    hotspots,
    loading,
    error,
    refresh,
  };
}

export default useHotspots;