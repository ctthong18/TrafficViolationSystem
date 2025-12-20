/**
 * Role-based Filtering Utilities
 * 
 * Utilities for filtering analytics data based on user roles and assigned areas.
 */

export interface UserRole {
  type: 'admin' | 'officer';
  assignedCameraIds?: number[];
  assignedPatrolAreas?: string[];
  assignedLocationIds?: string[];
}

export interface FilteredData<T> {
  data: T[];
  totalCount: number;
  filteredCount: number;
}

/**
 * Filter camera IDs based on user role and assignments
 */
export function filterCamerasByRole(
  allCameraIds: number[],
  userRole: UserRole
): number[] {
  if (userRole.type === 'admin') {
    return allCameraIds;
  }

  if (userRole.type === 'officer' && userRole.assignedCameraIds) {
    return allCameraIds.filter(id => userRole.assignedCameraIds!.includes(id));
  }

  return [];
}

/**
 * Filter hotspot data based on user role and patrol areas
 */
export function filterHotspotsByRole<T extends { locationId: string; cameraIds: number[] }>(
  hotspots: T[],
  userRole: UserRole
): FilteredData<T> {
  const totalCount = hotspots.length;

  if (userRole.type === 'admin') {
    return {
      data: hotspots,
      totalCount,
      filteredCount: totalCount,
    };
  }

  if (userRole.type === 'officer') {
    const filtered = hotspots.filter(hotspot => {
      // Filter by assigned location IDs
      if (userRole.assignedLocationIds?.includes(hotspot.locationId)) {
        return true;
      }

      // Filter by assigned camera IDs
      if (userRole.assignedCameraIds) {
        return hotspot.cameraIds.some(cameraId => 
          userRole.assignedCameraIds!.includes(cameraId)
        );
      }

      return false;
    });

    return {
      data: filtered,
      totalCount,
      filteredCount: filtered.length,
    };
  }

  return {
    data: [],
    totalCount,
    filteredCount: 0,
  };
}

/**
 * Filter camera performance data based on user role
 */
export function filterCameraPerformanceByRole<T extends { cameraId: number }>(
  performance: T[],
  userRole: UserRole
): FilteredData<T> {
  const totalCount = performance.length;

  if (userRole.type === 'admin') {
    return {
      data: performance,
      totalCount,
      filteredCount: totalCount,
    };
  }

  if (userRole.type === 'officer' && userRole.assignedCameraIds) {
    const filtered = performance.filter(perf => 
      userRole.assignedCameraIds!.includes(perf.cameraId)
    );

    return {
      data: filtered,
      totalCount,
      filteredCount: filtered.length,
    };
  }

  return {
    data: [],
    totalCount,
    filteredCount: 0,
  };
}

/**
 * Filter violation trends based on user role and assigned cameras
 */
export function filterViolationTrendsByRole<T extends { cameraId?: number }>(
  trends: T[],
  userRole: UserRole
): FilteredData<T> {
  const totalCount = trends.length;

  if (userRole.type === 'admin') {
    return {
      data: trends,
      totalCount,
      filteredCount: totalCount,
    };
  }

  if (userRole.type === 'officer' && userRole.assignedCameraIds) {
    const filtered = trends.filter(trend => {
      // Include trends without camera ID (system-wide trends)
      if (!trend.cameraId) {
        return false; // Officers should only see their assigned camera data
      }

      return userRole.assignedCameraIds!.includes(trend.cameraId);
    });

    return {
      data: filtered,
      totalCount,
      filteredCount: filtered.length,
    };
  }

  return {
    data: [],
    totalCount,
    filteredCount: 0,
  };
}

/**
 * Filter action recommendations based on user role
 */
export function filterRecommendationsByRole<T extends { 
  supportingData: { affectedCameras?: number[] } 
}>(
  recommendations: T[],
  userRole: UserRole
): FilteredData<T> {
  const totalCount = recommendations.length;

  if (userRole.type === 'admin') {
    return {
      data: recommendations,
      totalCount,
      filteredCount: totalCount,
    };
  }

  if (userRole.type === 'officer' && userRole.assignedCameraIds) {
    const filtered = recommendations.filter(rec => {
      const affectedCameras = rec.supportingData.affectedCameras;
      
      if (!affectedCameras || affectedCameras.length === 0) {
        return false; // Officers should only see recommendations for their cameras
      }

      return affectedCameras.some(cameraId => 
        userRole.assignedCameraIds!.includes(cameraId)
      );
    });

    return {
      data: filtered,
      totalCount,
      filteredCount: filtered.length,
    };
  }

  return {
    data: [],
    totalCount,
    filteredCount: 0,
  };
}

/**
 * Get display message for filtered data
 */
export function getFilterMessage(
  userRole: UserRole,
  filteredCount: number,
  totalCount: number
): string | null {
  if (userRole.type === 'admin') {
    return null; // No filter message for admin
  }

  if (userRole.type === 'officer') {
    const assignedCameras = userRole.assignedCameraIds?.length || 0;
    const assignedAreas = userRole.assignedPatrolAreas?.length || 0;
    
    if (filteredCount === 0) {
      return 'No data available for your assigned patrol areas.';
    }

    if (filteredCount < totalCount) {
      return `Showing ${filteredCount} of ${totalCount} items for your assigned ${
        assignedCameras > 0 ? `${assignedCameras} cameras` : ''
      }${assignedCameras > 0 && assignedAreas > 0 ? ' and ' : ''}${
        assignedAreas > 0 ? `${assignedAreas} patrol areas` : ''
      }.`;
    }
  }

  return null;
}

/**
 * Create mock officer role for testing
 */
export function createMockOfficerRole(): UserRole {
  return {
    type: 'officer',
    assignedCameraIds: [1, 2, 3], // Officer assigned to cameras 1, 2, 3
    assignedPatrolAreas: ['Hoan Kiem District', 'Ba Dinh District'],
    assignedLocationIds: ['hotspot_1', 'hotspot_2'],
  };
}

/**
 * Create admin role
 */
export function createAdminRole(): UserRole {
  return {
    type: 'admin',
  };
}