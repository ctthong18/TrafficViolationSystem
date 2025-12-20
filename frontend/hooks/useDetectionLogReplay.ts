/**
 * useDetectionLogReplay Hook
 * 
 * Custom React hook for managing detection log replay functionality.
 * Handles starting/stopping replays and receiving detection results via WebSocket.
 */

import { useState, useCallback, useEffect } from 'react'
import { useRealtimeDetections, DetectionResult } from './useRealtimeDetections'

interface ReplayConfig {
  log_filename: string
  camera_id?: number
  speed_multiplier?: number
  start_frame?: number
  end_frame?: number
}

interface ReplayStatus {
  session_id: string | null
  status: 'idle' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error'
  error: string | null
}

export function useDetectionLogReplay() {
  const [replayStatus, setReplayStatus] = useState<ReplayStatus>({
    session_id: null,
    status: 'idle',
    error: null
  })

  const [loading, setLoading] = useState(false)
  const { latestDetection, isConnected, connect, disconnect } = useRealtimeDetections({
    autoConnect: true
  })

  const startReplay = useCallback(async (config: ReplayConfig) => {
    setLoading(true)
    setReplayStatus(prev => ({ ...prev, status: 'starting', error: null }))

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/detection-logs/logs/replay/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            log_filename: config.log_filename,
            camera_id: config.camera_id,
            speed_multiplier: config.speed_multiplier || 1.0,
            start_frame: config.start_frame || 0,
            end_frame: config.end_frame,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const data = await response.json()
      
      setReplayStatus({
        session_id: data.session_id,
        status: 'running',
        error: null
      })

      // Ensure WebSocket is connected
      if (!isConnected) {
        connect()
      }

      return data.session_id
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start replay'
      setReplayStatus(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }))
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, connect])

  const stopReplay = useCallback(async (sessionId: string) => {
    setLoading(true)
    setReplayStatus(prev => ({ ...prev, status: 'stopping' }))

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/detection-logs/logs/replay/${sessionId}/stop`,
        {
          method: 'POST',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      setReplayStatus({
        session_id: null,
        status: 'stopped',
        error: null
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop replay'
      setReplayStatus(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAvailableLogs = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/detection-logs/logs`
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      console.error('Error fetching available logs:', err)
      return []
    }
  }, [])

  const getLogSummary = useCallback(async (logFilename: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/detection-logs/logs/${logFilename}/summary`
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      console.error('Error fetching log summary:', err)
      return null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (replayStatus.session_id) {
        stopReplay(replayStatus.session_id).catch(console.error)
      }
    }
  }, [replayStatus.session_id, stopReplay])

  return {
    replayStatus,
    latestDetection,
    loading,
    isConnected,
    startReplay,
    stopReplay,
    getAvailableLogs,
    getLogSummary,
  }
}

