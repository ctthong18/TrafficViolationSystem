'use client';

import React from 'react';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export default function OfficerAnalyticsPage() {
  // In a real app, you would get assigned camera IDs from user context/API
  const assignedCameraIds = [1, 2, 3]; // Mock assigned cameras for officer

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <AnalyticsDashboard 
          userRole="officer" 
          assignedCameraIds={assignedCameraIds}
        />
      </div>
    </div>
  );
}