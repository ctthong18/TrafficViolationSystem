/**
 * Real-time Hooks Usage Examples
 * 
 * This file demonstrates various ways to use the useRealtimeDetections
 * and useRealtimeAnalytics hooks in your components.
 */

import React, { useState, useEffect } from 'react';
import { useRealtimeDetections } from '../useRealtimeDetections';
import { useRealtimeAnalytics } from '../useRealtimeAnalytics';

// Example 1: Basic Detection Monitoring
export function BasicDetectionMonitor() {
  const {
    isConnected,
    latestDetection,
    detectionHistory,
    error
  } = useRealtimeDetections();

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Detection Monitor</h2>
      
      <div className="mb-4">
        <span className={`px-2 py-1 rounded ${isConnected ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {latestDetection && (
        <div className="bg-blue-50 p-4 rounded mb-4">
          <h3 className="font-semibold mb-2">Latest Detection</h3>
          <p>Frame: {latestDetection.frame_number}</p>
          <p>Vehicles: {latestDetection.vehicle_count}</p>
          <p>Violations: {latestDetection.violations.length}</p>
          <p>Processing Time: {latestDetection.processing_time_ms.toFixed(2)}ms</p>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-2">Detection History</h3>
        <p className="text-sm text-gray-600">
          Total detections: {detectionHistory.length}
        </p>
      </div>
    </div>
  );
}

// Example 2: Analytics Dashboard
export function AnalyticsDashboard() {
  const {
    isConnected,
    currentMetrics,
    recommendations,
    hotspots,
    trends,
    metricsSummary
  } = useRealtimeAnalytics();

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Analytics Dashboard</h2>
      
      <div className="mb-4">
        <span className={`px-2 py-1 rounded ${isConnected ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {currentMetrics && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Active Violations</p>
            <p className="text-2xl font-bold">{currentMetrics.active_violations}</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-600">Vehicles/min</p>
            <p className="text-2xl font-bold">{currentMetrics.vehicles_per_minute.toFixed(1)}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded">
            <p className="text-sm text-gray-600">Avg Processing</p>
            <p className="text-2xl font-bold">{currentMetrics.average_processing_time.toFixed(0)}ms</p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm text-gray-600">Model Confidence</p>
            <p className="text-2xl font-bold">{(currentMetrics.model_confidence * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Recommendations</h3>
          {recommendations.map((rec, i) => (
            <div 
              key={i} 
              className={`p-3 rounded mb-2 ${
                rec.priority === 'high' ? 'bg-red-100 border-red-400' :
                rec.priority === 'medium' ? 'bg-yellow-100 border-yellow-400' :
                'bg-blue-100 border-blue-400'
              } border`}
            >
              <span className="font-semibold">[{rec.priority.toUpperCase()}]</span> {rec.message}
            </div>
          ))}
        </div>
      )}

      {hotspots.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Hotspots</h3>
          {hotspots.map((spot, i) => (
            <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded mb-2">
              <span>{spot.location}</span>
              <span className="flex items-center gap-2">
                <span className="font-semibold">{spot.violation_count}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  spot.risk_level === 'high' ? 'bg-red-500' :
                  spot.risk_level === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                } text-white`}>
                  {spot.risk_level}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      {trends && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Trends</h3>
          <p>Hourly Trend: <span className="font-semibold">{trends.hourly_violation_trend}</span></p>
          <p>Predicted Next Hour: <span className="font-semibold">{trends.predicted_next_hour}</span></p>
        </div>
      )}

      {metricsSummary && (
        <div className="mt-4 bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Summary (Last {metricsSummary.sample_count} samples)</h3>
          <p>Avg Violations: {metricsSummary.average_violations.toFixed(1)}</p>
          <p>Avg Vehicles/min: {metricsSummary.average_vehicles_per_minute.toFixed(1)}</p>
          <p>Avg Processing: {metricsSummary.average_processing_time.toFixed(0)}ms</p>
          <p>Avg Confidence: {(metricsSummary.average_model_confidence * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}

// Example 3: Manual Connection Control
export function ManualConnectionControl() {
  const {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    error
  } = useRealtimeDetections({
    autoConnect: false
  });

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Manual Connection Control</h2>
      
      <div className="mb-4">
        <p>Status: {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={connect}
          disabled={isConnected || isConnecting}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          Connect
        </button>
        <button
          onClick={disconnect}
          disabled={!isConnected}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

// Example 4: Detection History Chart
export function DetectionHistoryChart() {
  const { detectionHistory } = useRealtimeDetections();

  const chartData = detectionHistory.slice(-20).map(d => ({
    time: new Date(d.timestamp * 1000).toLocaleTimeString(),
    vehicles: d.vehicle_count,
    violations: d.violations.length
  }));

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Detection History (Last 20)</h2>
      
      <div className="space-y-2">
        {chartData.map((data, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="text-sm text-gray-600 w-24">{data.time}</span>
            <div className="flex-1 flex gap-2">
              <div 
                className="bg-blue-500 h-6 flex items-center justify-center text-white text-xs"
                style={{ width: `${data.vehicles * 10}px` }}
              >
                {data.vehicles}
              </div>
              {data.violations > 0 && (
                <div 
                  className="bg-red-500 h-6 flex items-center justify-center text-white text-xs"
                  style={{ width: `${data.violations * 10}px` }}
                >
                  {data.violations}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500"></div>
          <span>Vehicles</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500"></div>
          <span>Violations</span>
        </div>
      </div>
    </div>
  );
}

// Example 5: Combined Monitoring
export function CombinedMonitoring() {
  const detections = useRealtimeDetections({
    onDetection: (result) => {
      console.log('New detection:', result);
    }
  });

  const analytics = useRealtimeAnalytics({
    onAnalyticsUpdate: (data) => {
      console.log('Analytics update:', data);
    }
  });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Real-time Monitoring System</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Detections</h2>
          <p>Connected: {detections.isConnected ? 'Yes' : 'No'}</p>
          <p>Latest Frame: {detections.latestDetection?.frame_number || 'N/A'}</p>
          <p>History: {detections.detectionHistory.length} items</p>
        </div>
        
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Analytics</h2>
          <p>Connected: {analytics.isConnected ? 'Yes' : 'No'}</p>
          <p>Active Violations: {analytics.currentMetrics?.active_violations || 0}</p>
          <p>Recommendations: {analytics.recommendations.length}</p>
        </div>
      </div>

      {(detections.error || analytics.error) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {detections.error || analytics.error}
        </div>
      )}
    </div>
  );
}

// Example 6: Error Handling
export function ErrorHandlingExample() {
  const [errorLog, setErrorLog] = useState<string[]>([]);

  const { isConnected, error, connect } = useRealtimeDetections({
    autoConnect: true,
    onError: (err) => {
      setErrorLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${err.message}`]);
    }
  });

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Error Handling</h2>
      
      <div className="mb-4">
        <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        {error && (
          <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Current Error: {error}
          </div>
        )}
      </div>

      {errorLog.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Error Log</h3>
          <div className="bg-gray-50 p-4 rounded max-h-48 overflow-y-auto">
            {errorLog.map((msg, i) => (
              <p key={i} className="text-sm text-gray-700 mb-1">{msg}</p>
            ))}
          </div>
          <button
            onClick={() => setErrorLog([])}
            className="mt-2 px-3 py-1 bg-gray-500 text-white rounded text-sm"
          >
            Clear Log
          </button>
        </div>
      )}

      {!isConnected && (
        <button
          onClick={connect}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
}

// Example 7: Connection Health Monitor
export function ConnectionHealthMonitor() {
  const { isConnected, ping, connectionStatus } = useRealtimeDetections();
  const [lastPing, setLastPing] = useState<Date | null>(null);

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const success = ping();
      if (success) {
        setLastPing(new Date());
      }
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, ping]);

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Connection Health</h2>
      
      <div className="space-y-2">
        <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
        <p>Connecting: {connectionStatus.connecting ? 'Yes' : 'No'}</p>
        <p>Reconnect Attempts: {connectionStatus.reconnectAttempts}</p>
        <p>Last Ping: {lastPing ? lastPing.toLocaleTimeString() : 'Never'}</p>
        {connectionStatus.error && (
          <p className="text-red-600">Error: {connectionStatus.error}</p>
        )}
      </div>

      <button
        onClick={() => {
          const success = ping();
          if (success) setLastPing(new Date());
        }}
        disabled={!isConnected}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Ping Now
      </button>
    </div>
  );
}

// Export all examples
export default {
  BasicDetectionMonitor,
  AnalyticsDashboard,
  ManualConnectionControl,
  DetectionHistoryChart,
  CombinedMonitoring,
  ErrorHandlingExample,
  ConnectionHealthMonitor
};
