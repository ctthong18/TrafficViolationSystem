/**
 * Analytics Hooks Tests
 * 
 * Unit tests for the analytics hooks to verify they work correctly
 */

import { renderHook, waitFor } from '@testing-library/react';
import useAnalyticsDashboard from '../useAnalyticsDashboard';
import useModelPerformance from '../useModelPerformance';

describe('Analytics Hooks', () => {
  const mockTimeRange = {
    start: '2024-12-01T00:00:00Z',
    end: '2024-12-08T23:59:59Z',
  };

  describe('useAnalyticsDashboard', () => {
    it('should fetch dashboard metrics successfully', async () => {
      const { result } = renderHook(() => 
        useAnalyticsDashboard(mockTimeRange, [1, 2, 3])
      );

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.metrics).toBe(null);
      expect(result.current.error).toBe(null);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify metrics are loaded
      expect(result.current.metrics).toBeTruthy();
      expect(result.current.metrics?.totalViolations).toBeGreaterThan(0);
      expect(result.current.metrics?.totalVehicles).toBeGreaterThan(0);
      expect(result.current.metrics?.activeCameras).toBeGreaterThan(0);
      expect(result.current.error).toBe(null);
    });

    it('should provide refresh functionality', async () => {
      const { result } = renderHook(() => 
        useAnalyticsDashboard(mockTimeRange)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialMetrics = result.current.metrics;
      
      // Call refresh
      result.current.refresh();
      
      // Should start loading again
      expect(result.current.loading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Should have new metrics (mock data will be different)
      expect(result.current.metrics).toBeTruthy();
    });
  });

  describe('useModelPerformance', () => {
    it('should fetch model performance metrics successfully', async () => {
      const { result } = renderHook(() => 
        useModelPerformance(mockTimeRange)
      );

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.metrics).toEqual([]);
      expect(result.current.currentHealth).toBe(null);
      expect(result.current.error).toBe(null);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify metrics are loaded
      expect(result.current.metrics.length).toBeGreaterThan(0);
      expect(result.current.currentHealth).toBeTruthy();
      expect(result.current.currentHealth?.overallStatus).toMatch(/healthy|warning|critical/);
      expect(result.current.error).toBe(null);
    });

    it('should provide model health information', async () => {
      const { result } = renderHook(() => 
        useModelPerformance(mockTimeRange)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const health = result.current.currentHealth;
      expect(health).toBeTruthy();
      expect(health?.alerts).toBeDefined();
      expect(health?.recommendations).toBeDefined();
      expect(health?.lastUpdated).toBeTruthy();
    });

    it('should provide refresh functionality', async () => {
      const { result } = renderHook(() => 
        useModelPerformance(mockTimeRange)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialMetrics = result.current.metrics;
      
      // Call refresh
      result.current.refresh();
      
      // Should start loading again
      expect(result.current.loading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Should have metrics
      expect(result.current.metrics.length).toBeGreaterThan(0);
    });
  });
});