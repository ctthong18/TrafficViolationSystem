'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Camera, AlertTriangle, Filter, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { UserRole, filterHotspotsByRole, getFilterMessage } from '@/lib/role-based-filtering';

interface HotspotData {
  locationId: string;
  locationName: string;
  coordinates: [number, number]; // [lat, lng]
  violationDensity: number;
  riskScore: number;
  primaryViolationTypes: string[];
  peakHours: string[];
  cameraIds: number[];
  violationCount: number;
}

interface CameraLocation {
  id: number;
  name: string;
  coordinates: [number, number];
  status: 'online' | 'offline' | 'maintenance';
  violationsToday: number;
}

interface HotspotMapProps {
  timeRange: {
    start: string;
    end: string;
  };
  violationType?: string;
  userRole?: UserRole;
  onHotspotClick?: (hotspot: HotspotData) => void;
  onCameraClick?: (camera: CameraLocation) => void;
}

type MapView = 'heatmap' | 'markers' | 'both';

export function HotspotMap({ 
  timeRange, 
  violationType, 
  userRole,
  onHotspotClick, 
  onCameraClick 
}: HotspotMapProps) {
  const [hotspots, setHotspots] = useState<HotspotData[]>([]);
  const [filteredHotspots, setFilteredHotspots] = useState<HotspotData[]>([]);
  const [cameras, setCameras] = useState<CameraLocation[]>([]);
  const [filteredCameras, setFilteredCameras] = useState<CameraLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState<MapView>('both');
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotData | null>(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  const mapRef = useRef<HTMLDivElement>(null);

  // Mock center coordinates (Hanoi, Vietnam)
  const mapCenter: [number, number] = [21.0285, 105.8542];

  useEffect(() => {
    fetchHotspotData();
    fetchCameraLocations();
  }, [timeRange, violationType]);

  useEffect(() => {
    // Apply role-based filtering when data or user role changes
    if (userRole) {
      const filteredHotspotsResult = filterHotspotsByRole(hotspots, userRole);
      setFilteredHotspots(filteredHotspotsResult.data);
      
      // Filter cameras based on user role
      if (userRole.type === 'officer' && userRole.assignedCameraIds) {
        const filteredCamerasResult = cameras.filter(camera => 
          userRole.assignedCameraIds!.includes(camera.id)
        );
        setFilteredCameras(filteredCamerasResult);
      } else {
        setFilteredCameras(cameras);
      }
    } else {
      setFilteredHotspots(hotspots);
      setFilteredCameras(cameras);
    }
  }, [hotspots, cameras, userRole]);

  const fetchHotspotData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockHotspots = generateMockHotspots();
      setHotspots(mockHotspots);
    } catch (error) {
      console.error('Failed to fetch hotspot data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCameraLocations = async () => {
    try {
      // Mock data - replace with actual API call
      const mockCameras = generateMockCameras();
      setCameras(mockCameras);
    } catch (error) {
      console.error('Failed to fetch camera locations:', error);
    }
  };

  const generateMockHotspots = (): HotspotData[] => {
    const locations = [
      { name: 'Hoan Kiem District', coords: [21.0285, 105.8542] as [number, number] },
      { name: 'Ba Dinh District', coords: [21.0368, 105.8340] as [number, number] },
      { name: 'Dong Da District', coords: [21.0136, 105.8270] as [number, number] },
      { name: 'Hai Ba Trung District', coords: [21.0122, 105.8580] as [number, number] },
      { name: 'Cau Giay District', coords: [21.0285, 105.7938] as [number, number] },
    ];

    return locations.map((location, index) => ({
      locationId: `hotspot_${index + 1}`,
      locationName: location.name,
      coordinates: location.coords,
      violationDensity: Math.floor(Math.random() * 100) + 20,
      riskScore: Math.random() * 0.4 + 0.6, // 0.6 - 1.0
      primaryViolationTypes: ['speeding', 'red_light', 'wrong_lane'].slice(0, Math.floor(Math.random() * 3) + 1),
      peakHours: ['08:00-09:00', '17:00-18:00', '12:00-13:00'].slice(0, Math.floor(Math.random() * 3) + 1),
      cameraIds: [index + 1, index + 2],
      violationCount: Math.floor(Math.random() * 50) + 10,
    }));
  };

  const generateMockCameras = (): CameraLocation[] => {
    const cameraLocations = [
      { name: 'Camera 1 - Hoan Kiem', coords: [21.0285, 105.8542] as [number, number] },
      { name: 'Camera 2 - Ba Dinh', coords: [21.0368, 105.8340] as [number, number] },
      { name: 'Camera 3 - Dong Da', coords: [21.0136, 105.8270] as [number, number] },
      { name: 'Camera 4 - Hai Ba Trung', coords: [21.0122, 105.8580] as [number, number] },
      { name: 'Camera 5 - Cau Giay', coords: [21.0285, 105.7938] as [number, number] },
      { name: 'Camera 6 - Thanh Xuan', coords: [21.0045, 105.8078] as [number, number] },
    ];

    return cameraLocations.map((camera, index) => ({
      id: index + 1,
      name: camera.name,
      coordinates: camera.coords,
      status: ['online', 'offline', 'maintenance'][Math.floor(Math.random() * 3)] as 'online' | 'offline' | 'maintenance',
      violationsToday: Math.floor(Math.random() * 30) + 5,
    }));
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 0.8) return 'bg-red-500';
    if (riskScore >= 0.6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore >= 0.8) return 'High Risk';
    if (riskScore >= 0.6) return 'Medium Risk';
    return 'Low Risk';
  };

  const getCameraStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'maintenance': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const handleHotspotClick = (hotspot: HotspotData) => {
    setSelectedHotspot(hotspot);
    if (onHotspotClick) {
      onHotspotClick(hotspot);
    }
  };

  const handleCameraClick = (camera: CameraLocation) => {
    if (onCameraClick) {
      onCameraClick(camera);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Violation Hotspots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
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
            <MapPin className="h-5 w-5" />
            Violation Hotspots
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={mapView} onValueChange={(value) => setMapView(value as MapView)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="heatmap">Heatmap</SelectItem>
                <SelectItem value="markers">Markers</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.min(zoomLevel + 1, 18))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.max(zoomLevel - 1, 8))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Map Container - Placeholder for actual map implementation */}
        <div 
          ref={mapRef}
          className="h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 relative overflow-hidden"
        >
          {/* Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" className="text-gray-400">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          {/* Hotspot Markers */}
          {(mapView === 'markers' || mapView === 'both') && filteredHotspots.map((hotspot, index) => (
            <div
              key={hotspot.locationId}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${20 + (index * 15)}%`,
                top: `${30 + (index * 12)}%`,
              }}
              onClick={() => handleHotspotClick(hotspot)}
            >
              <div className={`w-6 h-6 rounded-full ${getRiskColor(hotspot.riskScore)} opacity-80 animate-pulse`}>
                <div className="w-full h-full rounded-full border-2 border-white flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {hotspot.locationName}
              </div>
            </div>
          ))}

          {/* Camera Markers */}
          {(mapView === 'markers' || mapView === 'both') && filteredCameras.map((camera, index) => (
            <div
              key={camera.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${25 + (index * 12)}%`,
                top: `${40 + (index * 10)}%`,
              }}
              onClick={() => handleCameraClick(camera)}
            >
              <div className={`w-4 h-4 rounded ${getCameraStatusColor(camera.status)}`}>
                <Camera className="h-4 w-4" />
              </div>
            </div>
          ))}

          {/* Heatmap Overlay */}
          {(mapView === 'heatmap' || mapView === 'both') && (
            <div className="absolute inset-0">
              {filteredHotspots.map((hotspot, index) => (
                <div
                  key={`heat-${hotspot.locationId}`}
                  className="absolute rounded-full opacity-30"
                  style={{
                    left: `${15 + (index * 15)}%`,
                    top: `${25 + (index * 12)}%`,
                    width: `${hotspot.violationDensity / 2}px`,
                    height: `${hotspot.violationDensity / 2}px`,
                    backgroundColor: hotspot.riskScore >= 0.8 ? '#ef4444' : hotspot.riskScore >= 0.6 ? '#f59e0b' : '#10b981',
                  }}
                />
              ))}
            </div>
          )}

          {/* Map Placeholder Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Interactive Map with Leaflet/Mapbox</p>
              <p className="text-xs">Will be implemented with real map library</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="h-3 w-3 text-blue-500" />
            <span className="text-sm">Cameras</span>
          </div>
        </div>

        {/* Hotspot Details */}
        {selectedHotspot && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{selectedHotspot.locationName}</h4>
              <Badge variant={selectedHotspot.riskScore >= 0.8 ? 'destructive' : selectedHotspot.riskScore >= 0.6 ? 'secondary' : 'default'}>
                {getRiskLabel(selectedHotspot.riskScore)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Violations:</span>
                <span className="ml-2 font-medium">{selectedHotspot.violationCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Density:</span>
                <span className="ml-2 font-medium">{selectedHotspot.violationDensity}/km²</span>
              </div>
              <div>
                <span className="text-gray-600">Primary Types:</span>
                <span className="ml-2">{selectedHotspot.primaryViolationTypes.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-600">Peak Hours:</span>
                <span className="ml-2">{selectedHotspot.peakHours.join(', ')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Role-based Filter Message */}
        {userRole && userRole.type === 'officer' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-700">
              {getFilterMessage(userRole, filteredHotspots.length, hotspots.length)}
            </div>
          </div>
        )}

        {/* Statistics Summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {filteredHotspots.filter(h => h.riskScore >= 0.8).length}
            </div>
            <div className="text-sm text-red-700">High Risk Areas</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {filteredCameras.filter(c => c.status === 'online').length}
            </div>
            <div className="text-sm text-blue-700">Active Cameras</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {filteredHotspots.reduce((sum, h) => sum + h.violationCount, 0)}
            </div>
            <div className="text-sm text-green-700">Total Violations</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default HotspotMap;