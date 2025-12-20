'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Activity, 
  TrendingUp,
  Settings,
  RefreshCw
} from 'lucide-react';
import { UserRole, filterCameraPerformanceByRole, getFilterMessage } from '@/lib/role-based-filtering';

interface CameraPerformance {
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

interface CameraPerformancePanelProps {
  cameraIds?: number[];
  timeRange?: {
    start: string;
    end: string;
  };
  userRole?: UserRole;
  onCameraSelect?: (cameraId: number) => void;
  onRecommendationClick?: (cameraId: number, recommendation: string) => void;
}

export function CameraPerformancePanel({ 
  cameraIds, 
  timeRange, 
  userRole,
  onCameraSelect, 
  onRecommendationClick 
}: CameraPerformancePanelProps) {
  const [performances, setPerformances] = useState<CameraPerformance[]>([]);
  const [filteredPerformances, setFilteredPerformances] = useState<CameraPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'uptime' | 'accuracy' | 'violations'>('uptime');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'degraded'>('all');

  useEffect(() => {
    fetchCameraPerformance();
  }, [cameraIds, timeRange]);

  useEffect(() => {
    // Apply role-based filtering when data or user role changes
    let filtered = performances;
    
    if (userRole) {
      const roleFiltered = filterCameraPerformanceByRole(performances, userRole);
      filtered = roleFiltered.data;
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    
    // Apply sorting
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'uptime':
          return b.uptime - a.uptime;
        case 'accuracy':
          return b.detectionAccuracy - a.detectionAccuracy;
        case 'violations':
          return b.totalViolations - a.totalViolations;
        default:
          return 0;
      }
    });
    
    setFilteredPerformances(filtered);
  }, [performances, userRole, filterStatus, sortBy]);

  const fetchCameraPerformance = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockPerformances = generateMockPerformances();
      setPerformances(mockPerformances);
    } catch (error) {
      console.error('Failed to fetch camera performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPerformances = (): CameraPerformance[] => {
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

    // Filter cameras based on cameraIds prop if provided
    const filteredCameras = cameraIds?.length 
      ? cameras.filter(camera => cameraIds.includes(camera.id))
      : cameras;

    return filteredCameras.map(camera => {
      const uptime = Math.random() * 30 + 70; // 70-100%
      const accuracy = Math.random() * 20 + 80; // 80-100%
      const status = uptime > 95 ? 'online' : uptime > 80 ? 'degraded' : 'offline';
      
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
          detectionsToday: Math.floor(Math.random() * 100) + 50,
          violationsToday: Math.floor(Math.random() * 20) + 5,
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
    
    if (recommendations.length === 0) {
      recommendations.push('Performance is optimal');
    }
    
    return recommendations;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Camera className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'offline': return 'destructive';
      case 'degraded': return 'secondary';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPerformanceColor = (value: number, type: 'uptime' | 'accuracy') => {
    if (type === 'uptime' || type === 'accuracy') {
      if (value >= 95) return 'text-green-600';
      if (value >= 85) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const filterMessage = userRole ? getFilterMessage(userRole, filteredPerformances.length, performances.length) : null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Camera Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Performance
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCameraPerformance}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-sm text-gray-600">Filter:</span>
          {['all', 'online', 'offline', 'degraded'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status as any)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
          
          <span className="text-sm text-gray-600 ml-4">Sort by:</span>
          {[
            { key: 'uptime', label: 'Uptime' },
            { key: 'accuracy', label: 'Accuracy' },
            { key: 'violations', label: 'Violations' },
          ].map((sort) => (
            <Button
              key={sort.key}
              variant={sortBy === sort.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(sort.key as any)}
            >
              {sort.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {/* Role-based Filter Message */}
        {filterMessage && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-700">
              {filterMessage}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {filteredPerformances.filter(p => p.status === 'online').length}
            </div>
            <div className="text-sm text-green-700">Online</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredPerformances.filter(p => p.status === 'degraded').length}
            </div>
            <div className="text-sm text-yellow-700">Degraded</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {filteredPerformances.filter(p => p.status === 'offline').length}
            </div>
            <div className="text-sm text-red-700">Offline</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {filteredPerformances.length > 0 ? Math.round(filteredPerformances.reduce((sum, p) => sum + p.uptime, 0) / filteredPerformances.length) : 0}%
            </div>
            <div className="text-sm text-blue-700">Avg Uptime</div>
          </div>
        </div>

        {/* Camera Performance List */}
        <div className="space-y-4">
          {filteredPerformances.map((camera) => (
            <div
              key={camera.cameraId}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onCameraSelect?.(camera.cameraId)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(camera.status)}
                  <div>
                    <h4 className="font-medium">{camera.cameraName}</h4>
                    <p className="text-sm text-gray-600">{camera.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getTrendIcon(camera.performanceTrend)}
                  <Badge variant={getStatusColor(camera.status) as any}>
                    {camera.status}
                  </Badge>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600">Uptime</div>
                  <div className={`font-medium ${getPerformanceColor(camera.uptime, 'uptime')}`}>
                    {camera.uptime}%
                  </div>
                  <Progress value={camera.uptime} className="h-2 mt-1" />
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                  <div className={`font-medium ${getPerformanceColor(camera.detectionAccuracy, 'accuracy')}`}>
                    {camera.detectionAccuracy}%
                  </div>
                  <Progress value={camera.detectionAccuracy} className="h-2 mt-1" />
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Processing Time</div>
                  <div className="font-medium">{camera.averageProcessingTime}ms</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Violations Today</div>
                  <div className="font-medium">{camera.dailyStats.violationsToday}</div>
                </div>
              </div>

              {/* Recommendations */}
              {camera.recommendations.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm text-gray-600 mb-2">Recommendations:</div>
                  <div className="flex flex-wrap gap-2">
                    {camera.recommendations.map((rec, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecommendationClick?.(camera.cameraId, rec);
                        }}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        {rec}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Active */}
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                Last active: {new Date(camera.lastActive).toLocaleString('vi-VN')}
              </div>
            </div>
          ))}
        </div>

        {filteredPerformances.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No cameras found matching the current filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CameraPerformancePanel;