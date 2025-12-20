'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Filter, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import { UserRole, filterCamerasByRole, getFilterMessage } from '@/lib/role-based-filtering';
import ViolationTrendsChart from './ViolationTrendsChart';
import HotspotMap from './HotspotMap';
import CameraPerformancePanel from './CameraPerformancePanel';
import ActionRecommendationsPanel from './ActionRecommendationsPanel';

interface TimeRange {
  start: string;
  end: string;
  label: string;
}

interface DashboardMetrics {
  totalViolations: number;
  violationsTrend: number;
  activeCameras: number;
  totalCameras: number;
  violationsToday: number;
  violationsTodayTrend: number;
  averageSpeed: number;
  processingPerformance: number;
}

interface AnalyticsDashboardProps {
  userRole: UserRole;
}

const timeRanges: TimeRange[] = [
  { start: '1h', end: 'now', label: 'Last Hour' },
  { start: '24h', end: 'now', label: 'Last 24 Hours' },
  { start: '7d', end: 'now', label: 'Last 7 Days' },
  { start: '30d', end: 'now', label: 'Last 30 Days' },
  { start: '90d', end: 'now', label: 'Last 90 Days' },
];

export function AnalyticsDashboard({ userRole }: AnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(timeRanges[1]);
  const [allCameraIds] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8]); // Mock all camera IDs
  const [selectedCameras, setSelectedCameras] = useState<number[]>(() => 
    filterCamerasByRole(allCameraIds, userRole)
  );
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Real-time analytics updates via WebSocket
  const { currentMetrics: realtimeData, isConnected } = useRealtimeAnalytics();

  useEffect(() => {
    fetchDashboardMetrics();
  }, [selectedTimeRange, selectedCameras]);

  useEffect(() => {
    if (realtimeData) {
      updateMetricsFromRealtime(realtimeData);
      setLastUpdated(new Date());
    }
  }, [realtimeData]);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const params: any = {
        start_time: selectedTimeRange.start,
        end_time: selectedTimeRange.end,
      };

      if (selectedCameras.length > 0) {
        params.camera_ids = selectedCameras.join(',');
      }

      // Import analyticsApi dynamically to avoid circular imports
      const { analyticsApi } = await import('@/lib/api');
      const data = await analyticsApi.getDashboardMetrics(params);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      // Set mock data for development
      setMetrics({
        totalViolations: 1234,
        violationsTrend: 15,
        activeCameras: 24,
        totalCameras: 25,
        violationsToday: 89,
        violationsTodayTrend: -5,
        averageSpeed: 45,
        processingPerformance: 42.1,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMetricsFromRealtime = (realtimeMetrics: any) => {
    if (metrics) {
      setMetrics(prev => ({
        ...prev!,
        violationsToday: realtimeMetrics.active_violations || prev!.violationsToday,
        averageSpeed: realtimeMetrics.average_speed || prev!.averageSpeed,
        processingPerformance: realtimeMetrics.processing_performance || prev!.processingPerformance,
      }));
    }
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const params: any = {
        format,
        start_time: selectedTimeRange.start,
        end_time: selectedTimeRange.end,
      };

      if (selectedCameras.length > 0) {
        params.camera_ids = selectedCameras.join(',');
      }

      // Import analyticsApi dynamically to avoid circular imports
      const { analyticsApi } = await import('@/lib/api');
      const blob = await analyticsApi.exportData(params);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
            {userRole.type === 'admin' && <Badge variant="secondary" className="ml-2">Admin</Badge>}
            {userRole.type === 'officer' && <Badge variant="outline" className="ml-2">Officer</Badge>}
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time traffic monitoring and violation analytics
            {userRole.type === 'officer' && (
              <span className="block text-sm text-blue-600 mt-1">
                {getFilterMessage(userRole, selectedCameras.length, allCameraIds.length)}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"} className="mr-2">
            {isConnected ? "Live" : "Disconnected"}
          </Badge>
          <span className="text-sm text-gray-500">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select
            value={selectedTimeRange.label}
            onValueChange={(value) => {
              const range = timeRanges.find(r => r.label === value);
              if (range) setSelectedTimeRange(range);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.label} value={range.label}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {userRole.type === 'admin' && (
            <Select
              value={selectedCameras.length === allCameraIds.length ? 'all' : 'filtered'}
              onValueChange={(value) => {
                if (value === 'all') {
                  setSelectedCameras(allCameraIds);
                } else {
                  setSelectedCameras(filterCamerasByRole(allCameraIds, userRole));
                }
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Cameras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cameras ({allCameraIds.length})</SelectItem>
                <SelectItem value="filtered">Filtered ({selectedCameras.length})</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {userRole.type === 'officer' && (
            <Badge variant="outline" className="text-xs">
              {selectedCameras.length} Assigned Cameras
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardMetrics()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Select onValueChange={(format) => handleExport(format as 'csv' | 'pdf' | 'excel')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </SelectItem>
              <SelectItem value="pdf">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </SelectItem>
              <SelectItem value="excel">
                <Download className="h-4 w-4 mr-2" />
                Excel
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
            {getTrendIcon(metrics?.violationsTrend || 0)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalViolations?.toLocaleString() || '0'}</div>
            <p className={`text-xs ${getTrendColor(metrics?.violationsTrend || 0)}`}>
              {metrics?.violationsTrend ? `${metrics.violationsTrend > 0 ? '+' : ''}${metrics.violationsTrend}%` : '0%'} from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cameras</CardTitle>
            <Badge variant={metrics?.activeCameras === metrics?.totalCameras ? "default" : "secondary"}>
              {metrics?.activeCameras || 0}/{metrics?.totalCameras || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeCameras || 0}</div>
            <p className="text-xs text-gray-600">
              {metrics?.totalCameras ? Math.round(((metrics.activeCameras || 0) / metrics.totalCameras) * 100) : 0}% uptime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations Today</CardTitle>
            {getTrendIcon(metrics?.violationsTodayTrend || 0)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.violationsToday || 0}</div>
            <p className={`text-xs ${getTrendColor(metrics?.violationsTodayTrend || 0)}`}>
              {metrics?.violationsTodayTrend ? `${metrics.violationsTodayTrend > 0 ? '+' : ''}${metrics.violationsTodayTrend}%` : '0%'} vs yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Speed</CardTitle>
            <Badge variant="outline">{metrics?.averageSpeed || 0} km/h</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.averageSpeed || 0}</div>
            <p className="text-xs text-gray-600">
              Processing: {metrics?.processingPerformance || 0}ms avg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violation Trends Chart */}
        <div className="lg:col-span-2">
          <ViolationTrendsChart 
            timeRange={selectedTimeRange}
            cameraIds={selectedCameras}
            userRole={userRole}
          />
        </div>

        {/* Hotspot Map */}
        <HotspotMap 
          timeRange={selectedTimeRange}
          userRole={userRole}
        />

        {/* Action Recommendations */}
        <ActionRecommendationsPanel 
          timeRange={selectedTimeRange}
          userRole={userRole}
        />
      </div>

      {/* Camera Performance */}
      <CameraPerformancePanel 
        cameraIds={selectedCameras}
        timeRange={selectedTimeRange}
        userRole={userRole}
      />
    </div>
  );
}

export default AnalyticsDashboard;