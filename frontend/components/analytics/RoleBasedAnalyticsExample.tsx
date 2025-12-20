'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserRole, createAdminRole, createMockOfficerRole } from '@/lib/role-based-filtering';
import AnalyticsDashboard from './AnalyticsDashboard';

/**
 * Example component demonstrating role-based filtering in analytics
 * This shows how the same analytics components behave differently for admin vs officer roles
 */
export function RoleBasedAnalyticsExample() {
  const [currentRole, setCurrentRole] = useState<UserRole>(createAdminRole());

  const switchToAdmin = () => {
    setCurrentRole(createAdminRole());
  };

  const switchToOfficer = () => {
    setCurrentRole(createMockOfficerRole());
  };

  return (
    <div className="space-y-6">
      {/* Role Switcher */}
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Analytics Demo</CardTitle>
        </CardHeader>
        <CardContent>
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
                Switch to Admin
              </Button>
              <Button
                variant={currentRole.type === 'officer' ? 'default' : 'outline'}
                size="sm"
                onClick={switchToOfficer}
              >
                Switch to Officer
              </Button>
            </div>
          </div>

          {/* Role Information */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm">
              <div className="font-medium mb-2">Role Details:</div>
              {currentRole.type === 'admin' ? (
                <div className="text-gray-600">
                  • Full access to all cameras and locations
                  • Can view system-wide analytics
                  • Access to all recommendations and performance data
                </div>
              ) : (
                <div className="text-gray-600">
                  • Assigned Cameras: {currentRole.assignedCameraIds?.join(', ') || 'None'}
                  • Patrol Areas: {currentRole.assignedPatrolAreas?.join(', ') || 'None'}
                  • Limited to assigned locations only
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Dashboard with Role-Based Filtering */}
      <AnalyticsDashboard userRole={currentRole} />
    </div>
  );
}

export default RoleBasedAnalyticsExample;