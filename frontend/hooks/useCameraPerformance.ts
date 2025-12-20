/**
 * useCameraPerformance Hook
 * 
 * Custom React hook for fetching and managing camera performance data
 * with metrics tracking and status monitoring.
 */

import { useState, useEffect, useCallback } from 'react';

export interface CameraPerformance {
  cameraId: number;
  cameraName: string;
  location: string;
  uptime: number; // percentage
  detectionAccuracy: number;
  averageProcessingTime: number;
  totalDetections: number;
  totalViolations: number;
  lastActive: string;
  status: 'online' | 'offline' | 'degraded';
  recommendations: string[];
  dailyStats: {
    detectionsToday: number;
    violationsToday: number;
    averageConfidence: number;
    errorRate: number;
  };
  performanceTrend: 'improving' | 'declining' | 'stable';
}

export interface UseCameraPerformanceResult {
  performance: CameraPerformance[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCameraPerformance(cameraIds?: number[]): UseCameraPerformanceResult {
  const [performance, setPerformance] = useState<CameraPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCameraPerformance = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (cameraIds?.length) {
        queryParams.append('camera_ids', cameraIds.join(','));
      }

      // Import analyticsApi dynamically to avoid circular imports
      // const { analyticsApi } = await import('@/lib/api');
      
      // For now, use mock data since the API endpoint might not be fully implemented
      const mockPerformance = generateMockPerformance(cameraIds);
      setPerformance(mockPerformance);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await analyticsApi.getCameraPerformance(queryParams.toString());
      // setPerformance(response.performance);
      
    } catch (err) {
      console.error('Failed to fetch camera performance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch camera performance');
    } finally {
      setLoading(false);
    }
  }, [cameraIds]);

  const generateMockPerformance = (filterCameraIds?: number[]): CameraPerformance[] => {
    const cameras = [
      { id: 1, name: 'Camera 1', location: 'Hoan Kiem District' },
      { id: 2, name: 'Camera 2', location: 'Ba Dinh District' },
      { id: 3, name: 'Camera 3', location: 'Dong Da District' },
      { id: 4, name: 'Camera 4', location: 'Hai Ba Trung District' },
      { id: 5, name: 'Camera 5', location: 'Cau Giay District' },
      { id: 6, name: 'Camera 6', location: 'Thanh Xuan District' },
      { id: 7, name: 'Camera 7', location: 'Tay Ho District' },
      { id: 8, name: 'Camera 8', location: 'Long Bien District' },
    ];

    // Filter cameras if specific IDs are provided
    const filteredCameras = filterCameraIds?.length 
      ? cameras.filter(camera => filterCameraIds.includes(camera.id))
      : cameras;

    return filteredCameras.map(camera => {
      const uptime = Math.random() * 30 + 70; // 70-100%
      const accuracy = Math.random() * 20 + 80; // 80-100%
      const status = uptime > 95 ? 'online' : uptime > 80 ? 'degraded' : 'offline';
      const detectionsToday = Math.floor(Math.random() * 100) + 50;
      const violationsToday = Math.floor(Math.random() * 20) + 5;
      
      return {
        cameraId: camera.id,
        cameraName: camera.name,
        location: camera.location,
        uptime: Math.round(uptime * 100) / 100,
        detectionAccuracy: Math.round(accuracy * 100) / 100,
        averageProcessingTime: Math.round((Math.random() * 50 + 30) * 100) / 100,
        totalDetections: Math.floor(Math.random() * 1000) + 500,
        totalViolations: Math.floor(Math.random() * 100) + 20,
        lastActive: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        status: status as 'online' | 'offline' | 'degraded',
        recommendations: generateRecommendations(status, uptime, accuracy),
        dailyStats: {
          detectionsToday,
          violationsToday,
          averageConfidence: Math.round((Math.random() * 20 + 80) * 100) / 100,
          errorRate: Math.round((Math.random() * 5) * 100) / 100,
        },
        performanceTrend: ['improving', 'declining', 'stable'][Math.floor(Math.random() * 3)] as 'improving' | 'declining' | 'stable',
      };
    });
  };

  const generateRecommendations = (status: string, uptime: number, accuracy: number): string[] => {
    const recommendations: string[] = [];
    
    if (status === 'offline') {
      recommendations.push('Check network connection and power supply');
      recommendations.push('Verify camera hardware status');
    } else if (status === 'degraded') {
      recommendations.push('Monitor network stability');
      if (uptime < 90) recommendations.push('Schedule maintenance check');
    }
    
    if (accuracy < 85) {
      recommendations.push('Recalibrate detection models');
      recommendations.push('Clean camera lens and check positioning');
    }
    
    if (accuracy < 80) {
      recommendations.push('Consider camera replacement or upgrade');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance is optimal');
    }
    
    return recommendations;
  };

  const refresh = useCallback(() => {
    fetchCameraPerformance();
  }, [fetchCameraPerformance]);

  useEffect(() => {
    fetchCameraPerformance();
  }, [fetchCameraPerformance]);

  return {
    performance,
    loading,
    error,
    refresh,
  };
}

export default useCameraPerformance;