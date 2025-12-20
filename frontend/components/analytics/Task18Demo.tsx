'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole, createAdminRole, createMockOfficerRole } from '@/lib/role-based-filtering';
import AnalyticsDashboard from './AnalyticsDashboard';
import DailyStatsComparison from './DailyStatsComparison';
import OfficerReportExport from './OfficerReportExport';

/**
 * Comprehensive demo of Task 18 implementation:
 * - Role-based filtering for analytics components
 * - Daily stats comparison component
 * - Officer report export functionality
 */
export function Task18Demo() {
  const [currentRole, setCurrentRole] = useState<UserRole>(createMockOfficerRole());

  const switchToAdmin = () => {
    setCurrentRole(createAdminRole());
  };

  const switchToOfficer = () => {
    setCurrentRole(createMockOfficerRole());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Task 18: Analytics Dashboard for Officer - Implementation Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Current Role:</span>
                  <Badge variant={currentRole.type === 'admin' ? 'default' : 'outline'}>
                    {currentRole.type === 'admin' ? 'Administrator' : 'Traffic Officer'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={currentRole.type === 'admin' ? 'default' : 'outline'}
                    size="sm"
                    onClick={switchToAdmin}
                  >
                    Admin View
                  </Button>
                  <Button
                    variant={currentRole.type === 'officer' ? 'default' : 'outline'}
                    size="sm"
                    onClick={switchToOfficer}
                  >
                    Officer View
                  </Button>
                </div>
              </div>
            </div>

            {/* Task Implementation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800">✅ Task 18.1</div>
                <div className="text-sm text-green-700">Role-based filtering implemented</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800">✅ Task 18.3</div>
                <div className="text-sm text-green-700">Daily stats comparison component</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800">✅ Task 18.5</div>
                <div className="text-sm text-green-700">Officer report export functionality</div>
              </div>
            </div>

            {/* Role Information */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium mb-2">Current Role Details:</div>
                {currentRole.type === 'admin' ? (
                  <div className="text-gray-600">
                    • Full access to all cameras and locations<br/>
                    • Can view system-wide analytics<br/>
                    • Access to all recommendations and performance data
                  </div>
                ) : (
                  <div className="text-gray-600">
                    • Assigned Cameras: {currentRole.assignedCameraIds?.join(', ') || 'None'}<br/>
                    • Patrol Areas: {currentRole.assignedPatrolAreas?.join(', ') || 'None'}<br/>
                    • Data filtered to assigned locations only
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
          <TabsTrigger value="comparison">Daily Comparison</TabsTrigger>
          <TabsTrigger value="export">Report Export</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            The analytics dashboard shows role-based filtering in action. 
            Switch between Admin and Officer roles to see how the data changes.
          </div>
          <AnalyticsDashboard userRole={currentRole} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Daily statistics comparison with period-over-period analysis.
            Shows day-over-day, week-over-week, and month-over-month changes.
          </div>
          <DailyStatsComparison />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Officer report export functionality. Only available for officer roles.
            Generates filtered reports based on assigned patrol areas and cameras.
          </div>
          <OfficerReportExport 
            userRole={currentRole}
            onExportComplete={(format) => {
              alert(`Report exported successfully as ${format.toUpperCase()}`);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Task 18.1 - Role-based Filtering:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                <li>Created role-based filtering utilities in <code>lib/role-based-filtering.ts</code></li>
                <li>Updated all analytics components to support UserRole prop</li>
                <li>Implemented data filtering for cameras, hotspots, trends, and recommendations</li>
                <li>Added filter messages to inform officers about data restrictions</li>
              </ul>
            </div>
            
            <div>
              <strong>Task 18.3 - Daily Stats Comparison:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                <li>Created <code>DailyStatsComparison.tsx</code> component</li>
                <li>Supports day-over-day, week-over-week, month-over-month comparisons</li>
                <li>Highlights significant changes with visual indicators</li>
                <li>Includes interactive charts and detailed change analysis</li>
              </ul>
            </div>
            
            <div>
              <strong>Task 18.5 - Officer Report Export:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                <li>Created export utilities in <code>lib/officer-report-export.ts</code></li>
                <li>Supports CSV, PDF, and Excel export formats</li>
                <li>Filters data based on officer's assigned areas and cameras</li>
                <li>Includes violation summaries, camera performance, and hotspot data</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Task18Demo;