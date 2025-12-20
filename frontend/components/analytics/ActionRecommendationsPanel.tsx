'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  CheckCircle, 
  Clock, 
  Camera,
  Users,
  MapPin,
  X,
  Eye,
  Play
} from 'lucide-react';
import { UserRole, filterRecommendationsByRole, getFilterMessage } from '@/lib/role-based-filtering';

interface ActionRecommendation {
  id: string;
  type: 'camera_adjustment' | 'enforcement' | 'resource_allocation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  implementationEffort: string;
  confidenceScore: number;
  supportingData: {
    violationCount?: number;
    affectedCameras?: number[];
    timeRange?: string;
    statistics?: any;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  createdAt: string;
  estimatedCompletion?: string;
  assignedTo?: string;
}

interface ActionRecommendationsPanelProps {
  timeRange?: {
    start: string;
    end: string;
  };
  userRole?: UserRole;
  onRecommendationAction?: (id: string, action: 'implement' | 'dismiss' | 'view_details') => void;
  onStatusUpdate?: (id: string, status: ActionRecommendation['status']) => void;
}

export function ActionRecommendationsPanel({ 
  timeRange, 
  userRole,
  onRecommendationAction, 
  onStatusUpdate 
}: ActionRecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<ActionRecommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<ActionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'dismissed'>('all');
  const [filterType] = useState<'all' | 'camera_adjustment' | 'enforcement' | 'resource_allocation'>('all');

  useEffect(() => {
    fetchRecommendations();
  }, [timeRange]);

  useEffect(() => {
    // Apply role-based filtering when data or user role changes
    let filtered = recommendations;
    
    if (userRole) {
      const roleFiltered = filterRecommendationsByRole(recommendations, userRole);
      filtered = roleFiltered.data;
    }
    
    // Apply other filters
    filtered = filtered
      .filter(rec => filterPriority === 'all' || rec.priority === filterPriority)
      .filter(rec => filterStatus === 'all' || rec.status === filterStatus)
      .filter(rec => filterType === 'all' || rec.type === filterType)
      .sort((a, b) => {
        // Sort by priority first, then by creation date
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    
    setFilteredRecommendations(filtered);
  }, [recommendations, userRole, filterPriority, filterStatus, filterType]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockRecommendations = generateMockRecommendations();
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecommendations = (): ActionRecommendation[] => {
    const recommendations = [
      {
        id: 'rec_1',
        type: 'camera_adjustment' as const,
        priority: 'high' as const,
        title: 'Recalibrate Camera 3 Detection Model',
        description: 'Camera 3 showing 15% accuracy drop in license plate detection. Recommend model recalibration and lens cleaning.',
        expectedImpact: 'Increase detection accuracy by 20-25%',
        implementationEffort: 'Low - 2 hours maintenance window',
        confidenceScore: 0.92,
        supportingData: {
          violationCount: 45,
          affectedCameras: [3],
          timeRange: 'Last 7 days',
          statistics: { accuracyDrop: 15, missedDetections: 23 }
        },
        status: 'pending' as const,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'rec_2',
        type: 'enforcement' as const,
        priority: 'high' as const,
        title: 'Increase Patrol at Hoan Kiem Intersection',
        description: 'Violation hotspot detected with 300% increase in speeding violations during peak hours.',
        expectedImpact: 'Reduce violations by 40-50%',
        implementationEffort: 'Medium - Additional patrol resources',
        confidenceScore: 0.88,
        supportingData: {
          violationCount: 127,
          timeRange: 'Last 14 days',
          statistics: { violationIncrease: 300, peakHours: ['08:00-09:00', '17:00-18:00'] }
        },
        status: 'in_progress' as const,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        assignedTo: 'Officer Nguyen Van A',
      },
      {
        id: 'rec_3',
        type: 'resource_allocation' as const,
        priority: 'medium' as const,
        title: 'Deploy Additional Camera at Ba Dinh Square',
        description: 'Traffic analysis shows blind spot coverage gap affecting violation detection accuracy.',
        expectedImpact: 'Improve coverage by 35%',
        implementationEffort: 'High - New camera installation',
        confidenceScore: 0.75,
        supportingData: {
          violationCount: 89,
          timeRange: 'Last 30 days',
          statistics: { coverageGap: 35, estimatedMissedViolations: 25 }
        },
        status: 'pending' as const,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        id: 'rec_4',
        type: 'camera_adjustment' as const,
        priority: 'low' as const,
        title: 'Optimize Processing Parameters for Night Detection',
        description: 'Night-time detection accuracy can be improved by adjusting brightness and contrast parameters.',
        expectedImpact: 'Improve night detection by 15%',
        implementationEffort: 'Low - Configuration update',
        confidenceScore: 0.68,
        supportingData: {
          violationCount: 34,
          affectedCameras: [1, 2, 4, 5],
          timeRange: 'Last 30 days',
          statistics: { nightAccuracy: 72, dayAccuracy: 94 }
        },
        status: 'completed' as const,
        createdAt: new Date(Date.now() - 432000000).toISOString(),
      },
      {
        id: 'rec_5',
        type: 'enforcement' as const,
        priority: 'medium' as const,
        title: 'Schedule Traffic Education Campaign',
        description: 'Recurring violation patterns suggest need for public awareness campaign in high-violation areas.',
        expectedImpact: 'Long-term 20-30% violation reduction',
        implementationEffort: 'Medium - Campaign planning and execution',
        confidenceScore: 0.71,
        supportingData: {
          violationCount: 234,
          timeRange: 'Last 60 days',
          statistics: { recurringViolators: 45, educationImpact: 25 }
        },
        status: 'dismissed' as const,
        createdAt: new Date(Date.now() - 518400000).toISOString(),
      },
    ];

    return recommendations;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      case 'dismissed': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'camera_adjustment':
        return <Camera className="h-4 w-4" />;
      case 'enforcement':
        return <Users className="h-4 w-4" />;
      case 'resource_allocation':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dismissed':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleAction = (id: string, action: 'implement' | 'dismiss' | 'view_details') => {
    if (action === 'implement') {
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id ? { ...rec, status: 'in_progress' as const } : rec
        )
      );
      onStatusUpdate?.(id, 'in_progress');
    } else if (action === 'dismiss') {
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id ? { ...rec, status: 'dismissed' as const } : rec
        )
      );
      onStatusUpdate?.(id, 'dismissed');
    }
    
    onRecommendationAction?.(id, action);
  };

  const filterMessage = userRole ? getFilterMessage(userRole, filteredRecommendations.length, recommendations.length) : null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Action Recommendations</CardTitle>
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
            <Lightbulb className="h-5 w-5" />
            Action Recommendations
          </CardTitle>
          
          <Badge variant="outline">
            {filteredRecommendations.length} recommendations
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-sm text-gray-600">Priority:</span>
          {['all', 'high', 'medium', 'low'].map((priority) => (
            <Button
              key={priority}
              variant={filterPriority === priority ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterPriority(priority as any)}
              className="capitalize"
            >
              {priority}
            </Button>
          ))}
          
          <span className="text-sm text-gray-600 ml-4">Status:</span>
          {['all', 'pending', 'in_progress', 'completed', 'dismissed'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status as any)}
              className="capitalize"
            >
              {status.replace('_', ' ')}
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
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {filteredRecommendations.filter(r => r.priority === 'high' && r.status === 'pending').length}
            </div>
            <div className="text-sm text-red-700">High Priority</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {filteredRecommendations.filter(r => r.status === 'in_progress').length}
            </div>
            <div className="text-sm text-blue-700">In Progress</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {filteredRecommendations.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {filteredRecommendations.length > 0 ? Math.round(filteredRecommendations.reduce((sum, r) => sum + r.confidenceScore, 0) / filteredRecommendations.length * 100) : 0}%
            </div>
            <div className="text-sm text-gray-700">Avg Confidence</div>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {getTypeIcon(recommendation.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{recommendation.title}</h4>
                      <Badge variant={getPriorityColor(recommendation.priority) as any}>
                        {recommendation.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(recommendation.status)}
                  <Badge variant={getStatusColor(recommendation.status) as any}>
                    {recommendation.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Impact and Effort */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600">Expected Impact</div>
                  <div className="font-medium text-green-600">{recommendation.expectedImpact}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Implementation Effort</div>
                  <div className="font-medium">{recommendation.implementationEffort}</div>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Confidence Score</span>
                  <span className="font-medium">{Math.round(recommendation.confidenceScore * 100)}%</span>
                </div>
                <Progress value={recommendation.confidenceScore * 100} className="h-2" />
              </div>

              {/* Supporting Data */}
              {recommendation.supportingData && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Supporting Data:</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {recommendation.supportingData.violationCount && (
                      <div>
                        <span className="text-gray-600">Violations:</span>
                        <span className="ml-1 font-medium">{recommendation.supportingData.violationCount}</span>
                      </div>
                    )}
                    {recommendation.supportingData.timeRange && (
                      <div>
                        <span className="text-gray-600">Period:</span>
                        <span className="ml-1 font-medium">{recommendation.supportingData.timeRange}</span>
                      </div>
                    )}
                    {recommendation.supportingData.affectedCameras && (
                      <div>
                        <span className="text-gray-600">Cameras:</span>
                        <span className="ml-1 font-medium">{recommendation.supportingData.affectedCameras.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Created: {new Date(recommendation.createdAt).toLocaleDateString('vi-VN')}
                  {recommendation.assignedTo && (
                    <span className="ml-4">Assigned to: {recommendation.assignedTo}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(recommendation.id, 'view_details')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  
                  {recommendation.status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAction(recommendation.id, 'implement')}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Implement
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(recommendation.id, 'dismiss')}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRecommendations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No recommendations found matching the current filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ActionRecommendationsPanel;