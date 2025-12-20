# Real-time WebSocket Hooks

This directory contains custom React hooks for managing WebSocket connections to receive real-time data from the AI Traffic Detection System.

## Available Hooks

### 1. useRealtimeDetections

Hook for receiving real-time AI detection results including vehicle detections, violations, and bounding boxes.

**File**: `useRealtimeDetections.ts`

**Features**:
- Automatic WebSocket connection management
- Exponential backoff reconnection strategy
- Type-safe detection results
- Detection history tracking
- Error handling and recovery

**Usage**:

```typescript
import { useRealtimeDetections } from '@/hooks/useRealtimeDetections';

function DetectionComponent() {
  const {
    // Connection state
    isConnected,
    isConnecting,
    error,
    connectionStatus,
    
    // Detection data
    latestDetection,
    detectionHistory,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    ping,
    clearHistory
  } = useRealtimeDetections({
    autoConnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    onDetection: (result) => {
      console.log('New detection:', result);
    },
    onError: (error) => {
      console.error('Detection error:', error);
    }
  });

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {latestDetection && (
        <div>
          <p>Vehicles: {latestDetection.vehicle_count}</p>
          <p>Violations: {latestDetection.violations.length}</p>
        </div>
      )}
    </div>
  );
}
```

**Options**:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoConnect` | boolean | `true` | Auto-connect on mount |
| `reconnectInterval` | number | `3000` | Base reconnection interval (ms) |
| `maxReconnectAttempts` | number | `5` | Maximum reconnection attempts |
| `onDetection` | function | - | Callback for new detections |
| `onError` | function | - | Callback for errors |

**Return Values**:

| Property | Type | Description |
|----------|------|-------------|
| `isConnected` | boolean | Connection status |
| `isConnecting` | boolean | Connecting status |
| `error` | string \| null | Error message |
| `connectionStatus` | ConnectionStatus | Full connection status |
| `latestDetection` | DetectionResult \| null | Most recent detection |
| `detectionHistory` | DetectionResult[] | Last 100 detections |
| `connect` | function | Manually connect |
| `disconnect` | function | Manually disconnect |
| `sendMessage` | function | Send message to server |
| `ping` | function | Send ping to check health |
| `clearHistory` | function | Clear detection history |

**Types**:

```typescript
interface DetectionResult {
  frame_number: number;
  timestamp: number;
  processing_time_ms: number;
  vehicle_count: number;
  detections: VehicleDetection[];
  violations: Violation[];
  session_id: string;
  camera_id: number | null;
}

interface VehicleDetection {
  track_id: number | null;
  vehicle_type: string;
  bbox: number[];
  confidence: number;
  timestamp: number;
  class_id: number;
  speed_kmh?: number | null;
  license_plate?: string;
}

interface Violation {
  violation_type: string;
  description: string;
  confidence: number;
  bbox: number[];
  timestamp: number;
  vehicle_type: string;
  track_id?: number;
  speed_kmh?: number | null;
}
```

### 2. useRealtimeAnalytics

Hook for receiving real-time analytics updates including performance metrics, recommendations, and hotspots.

**File**: `useRealtimeAnalytics.ts`

**Features**:
- Real-time analytics streaming
- Performance metrics tracking
- Action recommendations
- Hotspot identification
- Trend analysis
- Automatic reconnection

**Usage**:

```typescript
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';

function AnalyticsComponent() {
  const {
    // Connection state
    isConnected,
    isConnecting,
    error,
    
    // Analytics data
    currentMetrics,
    recommendations,
    hotspots,
    trends,
    metricsHistory,
    metricsSummary,
    
    // Actions
    connect,
    disconnect,
    requestStatus,
    clearHistory
  } = useRealtimeAnalytics({
    autoConnect: true,
    onAnalyticsUpdate: (data) => {
      console.log('Analytics update:', data);
    }
  });

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      
      {currentMetrics && (
        <div>
          <p>Active Violations: {currentMetrics.active_violations}</p>
          <p>Vehicles/min: {currentMetrics.vehicles_per_minute}</p>
          <p>Avg Processing: {currentMetrics.average_processing_time}ms</p>
          <p>Model Confidence: {(currentMetrics.model_confidence * 100).toFixed(1)}%</p>
        </div>
      )}
      
      {recommendations.length > 0 && (
        <div>
          <h3>Recommendations</h3>
          {recommendations.map((rec, i) => (
            <div key={i} className={`priority-${rec.priority}`}>
              {rec.message}
            </div>
          ))}
        </div>
      )}
      
      {hotspots.length > 0 && (
        <div>
          <h3>Hotspots</h3>
          {hotspots.map((spot, i) => (
            <div key={i}>
              {spot.location}: {spot.violation_count} violations ({spot.risk_level})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Options**:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoConnect` | boolean | `true` | Auto-connect on mount |
| `reconnectInterval` | number | `3000` | Base reconnection interval (ms) |
| `maxReconnectAttempts` | number | `5` | Maximum reconnection attempts |
| `onAnalyticsUpdate` | function | - | Callback for analytics updates |
| `onError` | function | - | Callback for errors |

**Return Values**:

| Property | Type | Description |
|----------|------|-------------|
| `isConnected` | boolean | Connection status |
| `isConnecting` | boolean | Connecting status |
| `error` | string \| null | Error message |
| `currentMetrics` | RealtimeMetrics \| null | Current metrics |
| `recommendations` | ActionRecommendation[] | Action recommendations |
| `hotspots` | Hotspot[] | Violation hotspots |
| `trends` | TrendData \| null | Trend analysis |
| `metricsHistory` | RealtimeMetrics[] | Last 60 metrics |
| `metricsSummary` | object \| null | Computed summary |
| `connect` | function | Manually connect |
| `disconnect` | function | Manually disconnect |
| `requestStatus` | function | Request current status |
| `clearHistory` | function | Clear metrics history |

**Types**:

```typescript
interface RealtimeMetrics {
  active_violations: number;
  vehicles_per_minute: number;
  average_processing_time: number;
  model_confidence: number;
  frames_processed?: number;
  total_vehicles?: number;
  total_violations?: number;
}

interface ActionRecommendation {
  type: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  confidence_score?: number;
  expected_impact?: string;
}

interface Hotspot {
  location: string;
  violation_count: number;
  risk_level: 'high' | 'medium' | 'low';
  coordinates?: [number, number];
}

interface TrendData {
  hourly_violation_trend: 'increasing' | 'decreasing' | 'stable';
  predicted_next_hour: number;
  trend_strength?: number;
}
```

## Common Patterns

### 1. Combined Usage

Use both hooks together for comprehensive real-time monitoring:

```typescript
function RealtimeMonitoringBoard() {
  const detections = useRealtimeDetections();
  const analytics = useRealtimeAnalytics();

  return (
    <div>
      <DetectionPanel {...detections} />
      <AnalyticsPanel {...analytics} />
    </div>
  );
}
```

### 2. Manual Connection Control

Control connection lifecycle manually:

```typescript
function ControlledComponent() {
  const { connect, disconnect, isConnected } = useRealtimeDetections({
    autoConnect: false
  });

  return (
    <div>
      {!isConnected ? (
        <button onClick={connect}>Connect</button>
      ) : (
        <button onClick={disconnect}>Disconnect</button>
      )}
    </div>
  );
}
```

### 3. Error Handling

Handle connection errors gracefully:

```typescript
function ErrorHandlingComponent() {
  const [errorLog, setErrorLog] = useState<string[]>([]);

  const { error, isConnected } = useRealtimeDetections({
    onError: (err) => {
      setErrorLog(prev => [...prev, err.message]);
    }
  });

  return (
    <div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {errorLog.length > 0 && (
        <div>
          <h3>Error Log</h3>
          {errorLog.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 4. Data Visualization

Use detection history for charts:

```typescript
function DetectionChart() {
  const { detectionHistory } = useRealtimeDetections();

  const chartData = detectionHistory.map(d => ({
    time: new Date(d.timestamp * 1000).toLocaleTimeString(),
    vehicles: d.vehicle_count,
    violations: d.violations.length
  }));

  return <LineChart data={chartData} />;
}
```

### 5. Metrics Summary

Display aggregated metrics:

```typescript
function MetricsSummary() {
  const { metricsSummary } = useRealtimeAnalytics();

  if (!metricsSummary) return <p>No data yet...</p>;

  return (
    <div>
      <p>Avg Violations: {metricsSummary.average_violations.toFixed(1)}</p>
      <p>Avg Vehicles/min: {metricsSummary.average_vehicles_per_minute.toFixed(1)}</p>
      <p>Avg Processing: {metricsSummary.average_processing_time.toFixed(0)}ms</p>
      <p>Avg Confidence: {(metricsSummary.average_model_confidence * 100).toFixed(1)}%</p>
      <p>Samples: {metricsSummary.sample_count}</p>
    </div>
  );
}
```

## Connection Management

### Reconnection Strategy

Both hooks implement exponential backoff for reconnection:

1. First attempt: Immediate
2. Second attempt: 3 seconds
3. Third attempt: 6 seconds
4. Fourth attempt: 12 seconds
5. Fifth attempt: 24 seconds

After 5 failed attempts, reconnection stops and an error is set.

### Connection Health

Use the `ping()` method to check connection health:

```typescript
const { ping, isConnected } = useRealtimeDetections();

// Check health every 30 seconds
useEffect(() => {
  if (!isConnected) return;
  
  const interval = setInterval(() => {
    ping();
  }, 30000);
  
  return () => clearInterval(interval);
}, [isConnected, ping]);
```

## WebSocket Endpoints

The hooks connect to these WebSocket endpoints:

- **Detections**: `ws://host:port/ws/realtime-detections`
- **Analytics**: `ws://host:port/ws/analytics`

Configure the API URL via environment variable:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Performance Considerations

### Memory Management

- Detection history is limited to last 100 items
- Metrics history is limited to last 60 items (1 hour at 1/min)
- Use `clearHistory()` to free memory if needed

### Optimization Tips

1. **Disable auto-connect** if not immediately needed
2. **Use callbacks** instead of watching state for better performance
3. **Disconnect** when component unmounts (automatic)
4. **Throttle updates** in callbacks if processing is expensive

```typescript
// Throttle example
const throttledCallback = useCallback(
  throttle((detection) => {
    // Process detection
  }, 1000),
  []
);

useRealtimeDetections({
  onDetection: throttledCallback
});
```

## Troubleshooting

### Connection Issues

**Problem**: WebSocket won't connect

**Solutions**:
1. Check API URL in environment variables
2. Verify backend WebSocket server is running
3. Check browser console for errors
4. Verify CORS settings on backend

### Reconnection Failures

**Problem**: Reconnection attempts exhausted

**Solutions**:
1. Check network connectivity
2. Verify backend is accessible
3. Manually call `connect()` after fixing issues
4. Increase `maxReconnectAttempts` if needed

### Missing Data

**Problem**: Not receiving updates

**Solutions**:
1. Check `isConnected` status
2. Verify backend is sending messages
3. Check browser console for parsing errors
4. Use `requestStatus()` to trigger update

## Testing

### Mock WebSocket

For testing, mock the WebSocket:

```typescript
// __mocks__/useRealtimeDetections.ts
export const useRealtimeDetections = jest.fn(() => ({
  isConnected: true,
  latestDetection: mockDetection,
  detectionHistory: [mockDetection],
  connect: jest.fn(),
  disconnect: jest.fn()
}));
```

### Integration Testing

Test with real WebSocket server:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useRealtimeDetections } from './useRealtimeDetections';

test('connects and receives detections', async () => {
  const { result } = renderHook(() => useRealtimeDetections());
  
  await waitFor(() => {
    expect(result.current.isConnected).toBe(true);
  });
  
  await waitFor(() => {
    expect(result.current.latestDetection).not.toBeNull();
  }, { timeout: 5000 });
});
```

## Related Documentation

- [WebSocket API Documentation](../../fastapi/app/api/endpoints/stream.py)
- [Real-time Analytics Endpoints](../../fastapi/app/api/endpoints/realtime_analytics.py)
- [Frontend Components](../components/camera-system/)

## Support

For issues or questions:
1. Check browser console for errors
2. Verify WebSocket connection in Network tab
3. Check backend logs
4. Review this documentation
