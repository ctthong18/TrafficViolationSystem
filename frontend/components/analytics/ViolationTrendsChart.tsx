'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { UserRole, filterViolationTrendsByRole, getFilterMessage } from '@/lib/role-based-filtering';

interface TrendData {
  timestamp: string;
  violationCount: number;
  violationType: string;
  cameraId?: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  anomaly: boolean;
  forecast?: number;
}

interface SeasonalPattern {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  pattern: Array<{
    time: string;
    averageViolations: number;
    confidence: number;
  }>;
}

interface ViolationTrendsChartProps {
  timeRange: {
    start: string;
    end: string;
  };
  cameraIds?: number[];
  violationTypes?: string[];
  userRole?: UserRole;
  onTrendClick?: (data: TrendData) => void;
}

type ChartType = 'line' | 'area' | 'bar';
type Granularity = 'hourly' | 'daily' | 'weekly' | 'monthly';

export function ViolationTrendsChart({ 
  timeRange, 
  cameraIds, 
  violationTypes,
  userRole,
  onTrendClick: _onTrendClick 
}: ViolationTrendsChartProps) {
  // Handle trend click for drill-down functionality (unused for now)
  // const handleTrendClick = (data: any) => {
  //   if (onTrendClick && data) {
  //     onTrendClick(data);
  //   }
  // };
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [filteredTrendData, setFilteredTrendData] = useState<TrendData[]>([]);
  const [seasonalPatterns, setSeasonalPatterns] = useState<SeasonalPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [granularity, setGranularity] = useState<Granularity>('daily');
  const [showForecast, setShowForecast] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(true);

  useEffect(() => {
    fetchTrendData();
  }, [timeRange, cameraIds, violationTypes, granularity]);

  useEffect(() => {
    // Apply role-based filtering when data or user role changes
    if (userRole) {
      const filtered = filterViolationTrendsByRole(trendData, userRole);
      setFilteredTrendData(filtered.data);
    } else {
      setFilteredTrendData(trendData);
    }
  }, [trendData, userRole]);

  const fetchTrendData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        start_date: timeRange.start,
        end_date: timeRange.end,
        granularity,
      });

      if (cameraIds?.length) {
        params.append('camera_ids', cameraIds.join(','));
      }

      if (violationTypes?.length) {
        params.append('violation_types', violationTypes.join(','));
      }

      // Mock data for development - replace with actual API call
      const mockData = generateMockTrendData();
      setTrendData(mockData);
      
      // Generate seasonal patterns
      const patterns = generateSeasonalPatterns();
      setSeasonalPatterns(patterns);
    } catch (error) {
      console.error('Failed to fetch trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockTrendData = (): TrendData[] => {
    const data: TrendData[] = [];
    const now = new Date();
    const days = granularity === 'hourly' ? 1 : granularity === 'daily' ? 30 : granularity === 'weekly' ? 12 : 6;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      
      if (granularity === 'hourly') {
        date.setHours(date.getHours() - i);
      } else if (granularity === 'daily') {
        date.setDate(date.getDate() - i);
      } else if (granularity === 'weekly') {
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
        violationType: 'speeding',
        cameraId: cameraIds?.[Math.floor(Math.random() * (cameraIds?.length || 1))] || Math.floor(Math.random() * 8) + 1,
        trend: violationCount > 40 ? 'increasing' : violationCount < 25 ? 'decreasing' : 'stable',
        anomaly: isAnomaly,
        forecast: showForecast ? violationCount + Math.floor(Math.random() * 10) - 5 : undefined,
      });
    }
    
    return data;
  };

  const generateSeasonalPatterns = (): SeasonalPattern[] => {
    return [
      {
        period: 'hourly',
        pattern: Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          averageViolations: Math.floor(Math.random() * 30) + 10,
          confidence: 0.8 + Math.random() * 0.2,
        })),
      },
      {
        period: 'daily',
        pattern: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
          time: day,
          averageViolations: Math.floor(Math.random() * 40) + 15,
          confidence: 0.75 + Math.random() * 0.25,
        })),
      },
    ];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    switch (granularity) {
      case 'hourly':
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      case 'daily':
        return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
      case 'weekly':
        return `Week ${Math.ceil(date.getDate() / 7)}`;
      case 'monthly':
        return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
      default:
        return date.toLocaleDateString('vi-VN');
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderChart = () => {
    const chartData = filteredTrendData.map(item => ({
      ...item,
      time: formatTimestamp(item.timestamp),
      violations: item.violationCount,
      forecast: item.forecast,
    }));

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip 
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value, name) => [value, name === 'violations' ? 'Violations' : 'Forecast']}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="violations" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.3}
              name="Violations"
            />
            {showForecast && (
              <Area 
                type="monotone" 
                dataKey="forecast" 
                stroke="#f59e0b" 
                fill="#f59e0b" 
                fillOpacity={0.2}
                strokeDasharray="5 5"
                name="Forecast"
              />
            )}
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="violations" fill="#3b82f6" name="Violations" />
            {showForecast && (
              <Bar dataKey="forecast" fill="#f59e0b" name="Forecast" />
            )}
          </BarChart>
        );
      
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="violations" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="Violations"
            />
            {showForecast && (
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#f59e0b" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                name="Forecast"
              />
            )}
          </LineChart>
        );
    }
  };

  const anomalies = filteredTrendData.filter(item => item.anomaly);
  const overallTrend = filteredTrendData.length > 1 ? 
    (filteredTrendData[filteredTrendData.length - 1].violationCount > filteredTrendData[0].violationCount ? 'increasing' : 'decreasing') : 'stable';
  
  const filterMessage = userRole ? getFilterMessage(userRole, filteredTrendData.length, trendData.length) : null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Violation Trends</CardTitle>
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
          <div className="flex items-center gap-2">
            <CardTitle>Violation Trends</CardTitle>
            {getTrendIcon(overallTrend)}
            <Badge variant={overallTrend === 'increasing' ? 'destructive' : overallTrend === 'decreasing' ? 'default' : 'secondary'}>
              {overallTrend}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={granularity} onValueChange={(value) => setGranularity(value as Granularity)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-4">
          <Button
            variant={showForecast ? "default" : "outline"}
            size="sm"
            onClick={() => setShowForecast(!showForecast)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Forecast
          </Button>
          
          <Button
            variant={showAnomalies ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAnomalies(!showAnomalies)}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Anomalies ({anomalies.length})
          </Button>
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

        {/* Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Anomalies Alert */}
        {showAnomalies && anomalies.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Anomalies Detected</span>
            </div>
            <div className="text-sm text-yellow-700">
              {anomalies.length} unusual spikes detected in violation patterns. 
              These may indicate special events or system issues requiring investigation.
            </div>
          </div>
        )}

        {/* Seasonal Patterns Summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {seasonalPatterns.slice(0, 2).map((pattern) => (
            <div key={pattern.period} className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 capitalize">{pattern.period} Pattern</h4>
              <div className="text-sm text-gray-600">
                Peak: {pattern.pattern.reduce((max, curr) => 
                  curr.averageViolations > max.averageViolations ? curr : max
                ).time} ({pattern.pattern.reduce((max, curr) => 
                  curr.averageViolations > max.averageViolations ? curr : max
                ).averageViolations} avg violations)
              </div>
              <div className="text-sm text-gray-600">
                Low: {pattern.pattern.reduce((min, curr) => 
                  curr.averageViolations < min.averageViolations ? curr : min
                ).time} ({pattern.pattern.reduce((min, curr) => 
                  curr.averageViolations < min.averageViolations ? curr : min
                ).averageViolations} avg violations)
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ViolationTrendsChart;