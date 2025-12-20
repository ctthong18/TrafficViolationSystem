'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar,
  BarChart3,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonData {
  metric: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  significance: 'high' | 'medium' | 'low';
  unit?: string;
}

interface DailyStatsComparisonProps {
  onPeriodChange?: (currentPeriod: string, comparisonPeriod: string) => void;
}

type ComparisonPeriod = 'day-over-day' | 'week-over-week' | 'month-over-month' | 'custom';

export function DailyStatsComparison({ onPeriodChange }: DailyStatsComparisonProps) {
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>('day-over-day');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');

  useEffect(() => {
    fetchComparisonData();
  }, [comparisonPeriod]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData = generateMockComparisonData();
      setComparisonData(mockData);
      
      // Notify parent component of period change
      const periods = getPeriodLabels();
      onPeriodChange?.(periods.current, periods.previous);
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockComparisonData = (): ComparisonData[] => {
    const baseMetrics = [
      { name: 'Total Violations', current: 89, previous: 94, unit: '' },
      { name: 'Unique Vehicles', current: 1247, previous: 1189, unit: '' },
      { name: 'Average Speed', current: 45.2, previous: 47.1, unit: 'km/h' },
      { name: 'Detection Accuracy', current: 94.5, previous: 92.8, unit: '%' },
      { name: 'Camera Uptime', current: 98.2, previous: 96.7, unit: '%' },
      { name: 'Processing Performance', current: 42.1, previous: 45.3, unit: 'ms' },
      { name: 'Speeding Violations', current: 34, previous: 41, unit: '' },
      { name: 'Red Light Violations', current: 12, previous: 8, unit: '' },
      { name: 'Wrong Lane Violations', current: 23, previous: 28, unit: '' },
      { name: 'Peak Hour Traffic', current: 156, previous: 142, unit: 'vehicles/hour' },
    ];

    return baseMetrics.map(metric => {
      const change = metric.current - metric.previous;
      const changePercentage = metric.previous !== 0 ? (change / metric.previous) * 100 : 0;
      const absChangePercentage = Math.abs(changePercentage);
      
      return {
        metric: metric.name,
        currentValue: metric.current,
        previousValue: metric.previous,
        change,
        changePercentage: Math.round(changePercentage * 100) / 100,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        significance: absChangePercentage > 20 ? 'high' : absChangePercentage > 10 ? 'medium' : 'low',
        unit: metric.unit,
      };
    });
  };

  const getPeriodLabels = () => {
    const today = new Date();
    
    switch (comparisonPeriod) {
      case 'day-over-day':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          current: today.toLocaleDateString('vi-VN'),
          previous: yesterday.toLocaleDateString('vi-VN'),
        };
      
      case 'week-over-week':
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(thisWeekStart.getDate() - 7);
        return {
          current: `Week of ${thisWeekStart.toLocaleDateString('vi-VN')}`,
          previous: `Week of ${lastWeekStart.toLocaleDateString('vi-VN')}`,
        };
      
      case 'month-over-month':
        const thisMonth = today.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthStr = lastMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
        return {
          current: thisMonth,
          previous: lastMonthStr,
        };
      
      default:
        return {
          current: 'Current Period',
          previous: 'Previous Period',
        };
    }
  };

  const getTrendIcon = (trend: string, significance: string) => {
    const iconClass = `h-4 w-4 ${
      significance === 'high' ? 'text-red-500' : 
      significance === 'medium' ? 'text-yellow-500' : 
      'text-gray-500'
    }`;
    
    switch (trend) {
      case 'up':
        return <TrendingUp className={iconClass} />;
      case 'down':
        return <TrendingDown className={iconClass} />;
      default:
        return <Minus className={iconClass} />;
    }
  };

  const getTrendColor = (trend: string, metric: string) => {
    // For some metrics, "up" is bad (violations, processing time)
    const badMetrics = ['violations', 'processing performance'];
    const isBadMetric = badMetrics.some(bad => metric.toLowerCase().includes(bad));
    
    if (trend === 'up') {
      return isBadMetric ? 'text-red-600' : 'text-green-600';
    } else if (trend === 'down') {
      return isBadMetric ? 'text-green-600' : 'text-red-600';
    }
    return 'text-gray-600';
  };

  const getSignificanceBadge = (significance: string) => {
    switch (significance) {
      case 'high':
        return <Badge variant="destructive">High Impact</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Impact</Badge>;
      case 'low':
        return <Badge variant="outline">Low Impact</Badge>;
      default:
        return null;
    }
  };

  const filteredData = selectedMetric === 'all' 
    ? comparisonData 
    : comparisonData.filter(item => 
        item.metric.toLowerCase().includes(selectedMetric.toLowerCase())
      );

  const chartData = filteredData.map(item => ({
    metric: item.metric.length > 15 ? item.metric.substring(0, 15) + '...' : item.metric,
    current: item.currentValue,
    previous: item.previousValue,
    change: item.change,
  }));

  const periods = getPeriodLabels();
  const significantChanges = comparisonData.filter(item => item.significance === 'high');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Statistics Comparison</CardTitle>
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
            <BarChart3 className="h-5 w-5" />
            Daily Statistics Comparison
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select 
              value={comparisonPeriod} 
              onValueChange={(value) => setComparisonPeriod(value as ComparisonPeriod)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day-over-day">Day over Day</SelectItem>
                <SelectItem value="week-over-week">Week over Week</SelectItem>
                <SelectItem value="month-over-month">Month over Month</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchComparisonData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Period Information */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-600">Comparing:</span>
              <span className="ml-2 font-medium">{periods.current}</span>
            </div>
            <div>
              <span className="text-gray-600">vs</span>
              <span className="ml-2 font-medium">{periods.previous}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Significant Changes Alert */}
        {significantChanges.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Significant Changes Detected</span>
            </div>
            <div className="text-sm text-yellow-700">
              {significantChanges.length} metrics show high-impact changes that may require attention:
              <span className="ml-1 font-medium">
                {significantChanges.map(item => item.metric).join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* Metric Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter metrics:</span>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metrics</SelectItem>
                <SelectItem value="violations">Violations</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="traffic">Traffic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="mb-6">
          <h4 className="font-medium mb-4">Visual Comparison</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="metric" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === 'current' ? periods.current : periods.previous
                  ]}
                />
                <Legend />
                <Bar dataKey="previous" fill="#94a3b8" name="Previous Period" />
                <Bar dataKey="current" fill="#3b82f6" name="Current Period" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="space-y-3">
          <h4 className="font-medium">Detailed Changes</h4>
          {filteredData.map((item, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h5 className="font-medium">{item.metric}</h5>
                  {getSignificanceBadge(item.significance)}
                </div>
                
                <div className="flex items-center gap-2">
                  {getTrendIcon(item.trend, item.significance)}
                  <span className={`font-medium ${getTrendColor(item.trend, item.metric)}`}>
                    {item.changePercentage > 0 ? '+' : ''}{item.changePercentage}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Previous</div>
                  <div className="font-medium">
                    {item.previousValue.toLocaleString()} {item.unit}
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-600">Current</div>
                  <div className="font-medium">
                    {item.currentValue.toLocaleString()} {item.unit}
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-600">Change</div>
                  <div className={`font-medium ${getTrendColor(item.trend, item.metric)}`}>
                    {item.change > 0 ? '+' : ''}{item.change.toLocaleString()} {item.unit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No metrics found matching the current filter.
          </div>
        )}

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {comparisonData.filter(item => item.trend === 'up' && item.metric.toLowerCase().includes('violation')).length}
            </div>
            <div className="text-sm text-red-700">Violations Increased</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {comparisonData.filter(item => item.trend === 'up' && item.metric.toLowerCase().includes('performance')).length}
            </div>
            <div className="text-sm text-green-700">Performance Improved</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {comparisonData.filter(item => item.significance === 'high').length}
            </div>
            <div className="text-sm text-blue-700">High Impact Changes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DailyStatsComparison;