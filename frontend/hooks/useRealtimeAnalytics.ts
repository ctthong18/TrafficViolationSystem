/**
 * useRealtimeAnalytics Hook
 * 
 * Custom React hook for managing WebSocket connection to receive
 * real-time analytics updates and performance metrics.
 * 
 * Features:
 * - Real-time analytics streaming
 * - Performance metrics tracking
 * - Automatic reconnection
 * - Type-safe analytics data
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Types for analytics data
export interface RealtimeMetrics {
  active_violations: number;
  vehicles_per_minute: number;
  average_processing_time: number;
  model_confidence: number;
  frames_processed?: number;
  total_vehicles?: number;
  total_violations?: number;
}

export interface ActionRecommendation {
  type: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  confidence_score?: number;
  expected_impact?: string;
}

export interface Hotspot {
  location: string;
  violation_count: number;
  risk_level: 'high' | 'medium' | 'low';
  coordinates?: [number, number];
}

export interface TrendData {
  hourly_violation_trend: 'increasing' | 'decreasing' | 'stable';
  predicted_next_hour: number;
  trend_strength?: number;
}

export interface AnalyticsData {
  current_metrics: RealtimeMetrics;
  recommendations?: ActionRecommendation[];
  hotspots?: Hotspot[];
  trends?: TrendData;
}

export interface WebSocketMessage {
  message_type: string;
  timestamp: string;
  data: any;
}

export interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

interface UseRealtimeAnalyticsOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onAnalyticsUpdate?: (data: AnalyticsData) => void;
  onError?: (error: Error) => void;
}

export function useRealtimeAnalytics(options: UseRealtimeAnalyticsOptions = {}) {
  const {
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onAnalyticsUpdate,
    onError
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0
  });

  const [currentMetrics, setCurrentMetrics] = useState<RealtimeMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<ActionRecommendation[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<RealtimeMetrics[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, '') || 'localhost:8000';
    return `${protocol}//${host}/ws/analytics`;
  }, []);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      switch (message.message_type) {
        case 'analytics_update':
          const analyticsData = message.data as AnalyticsData;
          
          // Update current metrics
          if (analyticsData.current_metrics) {
            setCurrentMetrics(analyticsData.current_metrics);
            
            // Add to history (keep last 60 for 1 hour at 1 update/minute)
            setMetricsHistory(prev => {
              const updated = [...prev, analyticsData.current_metrics];
              return updated.slice(-60);
            });
          }

          // Update recommendations
          if (analyticsData.recommendations) {
            setRecommendations(analyticsData.recommendations);
          }

          // Update hotspots
          if (analyticsData.hotspots) {
            setHotspots(analyticsData.hotspots);
          }

          // Update trends
          if (analyticsData.trends) {
            setTrends(analyticsData.trends);
          }

          // Call callback if provided
          if (onAnalyticsUpdate) {
            onAnalyticsUpdate(analyticsData);
          }
          break;

        case 'connection_established':
          console.log('Analytics WebSocket connection established:', message.data);
          break;

        case 'status_response':
          console.log('Status response:', message.data);
          break;

        case 'pong':
          // Handle ping/pong for connection health
          break;

        case 'error':
          console.error('Analytics WebSocket error message:', message.data);
          setConnectionStatus(prev => ({
            ...prev,
            error: message.data.message || 'Unknown error'
          }));
          break;

        default:
          console.log('Unknown analytics message type:', message.message_type);
      }
    } catch (error) {
      console.error('Error parsing analytics WebSocket message:', error);
    }
  }, [onAnalyticsUpdate]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('Analytics WebSocket already connected');
      return;
    }

    setConnectionStatus(prev => ({
      ...prev,
      connecting: true,
      error: null
    }));

    try {
      const ws = new WebSocket(getWebSocketUrl());

      ws.onopen = () => {
        console.log('Analytics WebSocket connected');
        setConnectionStatus({
          connected: true,
          connecting: false,
          error: null,
          reconnectAttempts: 0
        });
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error('Analytics WebSocket error:', error);
        const errorMessage = 'Analytics WebSocket connection error';
        setConnectionStatus(prev => ({
          ...prev,
          error: errorMessage
        }));
        
        if (onError) {
          onError(new Error(errorMessage));
        }
      };

      ws.onclose = (event) => {
        console.log('Analytics WebSocket closed:', event.code, event.reason);
        setConnectionStatus(prev => ({
          ...prev,
          connected: false,
          connecting: false
        }));

        wsRef.current = null;

        // Attempt reconnection if not manually closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          
          const delay = reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1);
          console.log(`Reconnecting analytics in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          setConnectionStatus(prev => ({
            ...prev,
            reconnectAttempts: reconnectAttemptsRef.current
          }));

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionStatus(prev => ({
            ...prev,
            error: 'Max reconnection attempts reached'
          }));
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating analytics WebSocket:', error);
      setConnectionStatus(prev => ({
        ...prev,
        connecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  }, [getWebSocketUrl, handleMessage, reconnectInterval, maxReconnectAttempts, onError]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    setConnectionStatus({
      connected: false,
      connecting: false,
      error: null,
      reconnectAttempts: 0
    });
    reconnectAttemptsRef.current = 0;
  }, []);

  // Send message to server
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('Analytics WebSocket not connected, cannot send message');
    return false;
  }, []);

  // Send ping to check connection health
  const ping = useCallback(() => {
    return sendMessage({ type: 'ping' });
  }, [sendMessage]);

  // Request current status
  const requestStatus = useCallback(() => {
    return sendMessage({ type: 'get_status' });
  }, [sendMessage]);

  // Clear metrics history
  const clearHistory = useCallback(() => {
    setMetricsHistory([]);
  }, []);

  // Get metrics summary
  const getMetricsSummary = useCallback(() => {
    if (metricsHistory.length === 0) return null;

    const sum = metricsHistory.reduce((acc, metrics) => ({
      active_violations: acc.active_violations + metrics.active_violations,
      vehicles_per_minute: acc.vehicles_per_minute + metrics.vehicles_per_minute,
      average_processing_time: acc.average_processing_time + metrics.average_processing_time,
      model_confidence: acc.model_confidence + metrics.model_confidence
    }), {
      active_violations: 0,
      vehicles_per_minute: 0,
      average_processing_time: 0,
      model_confidence: 0
    });

    const count = metricsHistory.length;

    return {
      average_violations: sum.active_violations / count,
      average_vehicles_per_minute: sum.vehicles_per_minute / count,
      average_processing_time: sum.average_processing_time / count,
      average_model_confidence: sum.model_confidence / count,
      sample_count: count
    };
  }, [metricsHistory]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]); // Only run on mount/unmount

  return {
    // Connection state
    connectionStatus,
    isConnected: connectionStatus.connected,
    isConnecting: connectionStatus.connecting,
    error: connectionStatus.error,

    // Analytics data
    currentMetrics,
    recommendations,
    hotspots,
    trends,
    metricsHistory,

    // Computed data
    metricsSummary: getMetricsSummary(),

    // Actions
    connect,
    disconnect,
    sendMessage,
    ping,
    requestStatus,
    clearHistory
  };
}

export default useRealtimeAnalytics;
