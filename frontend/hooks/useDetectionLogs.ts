"use client"
import { useState, useEffect } from "react"

export interface DetectionLogInfo {
  filename: string
  filepath: string
  size_bytes: number
  created_at: string
  modified_at: string
  timestamp_str: string
  video_path?: string
  total_frames?: number
  total_vehicles?: number
  max_speed?: number
  fps?: number
}

export interface FrameDetection {
  track_id: number
  vehicle_type: string
  bbox: [number, number, number, number]
  confidence: number
  speed: number
  speed_unit: string
  license_plate: string
  license_plate_bbox?: [number, number, number, number]
  class_id: number
  frame_position: {
    x_center: number
    y_bottom: number
  }
}

export interface ViolationEvent {
  track_id: number
  type: string
  speed: number
  threshold: number
  license_plate: string
}

export interface FrameDetectionData {
  frame_number: number
  timestamp: string
  processing_time_ms: number
  vehicle_count: number
  detections: FrameDetection[]
  violations: ViolationEvent[]
}

export interface DetectionLogSummary {
  video_info: {
    width: number
    height: number
    fps: number
    video_path: string
    start_time: string
  }
  model_info: {
    vehicle_model: string
    lp_detect_model: string
    lp_recog_model: string
    confidence_threshold: number
    iou_threshold: number
    vehicle_classes: Record<string, string>
  }
  summary: {
    total_frames: number
    total_vehicles: number
    max_speed: number
    license_plates_detected: number
    vehicle_types: Record<string, number>
    end_time: string
  }
  total_detections: number
  detection_frames: number[]
}

/**
 * Hook for fetching available detection logs
 */
export function useDetectionLogs() {
  const [logs, setLogs] = useState<DetectionLogInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/detection-logs/detection-logs`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setLogs(data)
    } catch (err) {
      console.error('Failed to fetch detection logs:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch detection logs')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  return { logs, loading, error, refetch: fetchLogs }
}

/**
 * Hook for fetching detection log summary
 */
export function useDetectionLogSummary(logFilename: string | null) {
  const [summary, setSummary] = useState<DetectionLogSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = async () => {
    if (!logFilename) {
      setSummary(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/detection-logs/detection-logs/${logFilename}/summary`
      )
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setSummary(data)
    } catch (err) {
      console.error('Failed to fetch log summary:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch log summary')
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [logFilename])

  return { summary, loading, error, refetch: fetchSummary }
}

/**
 * Hook for fetching frame detection data
 */
export function useFrameDetections(logFilename: string | null, frameNumber: number | null) {
  const [frameData, setFrameData] = useState<FrameDetectionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFrameData = async () => {
    if (!logFilename || frameNumber === null) {
      setFrameData(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/detection-logs/detection-logs/${logFilename}/frame/${frameNumber}`
      )
      if (!response.ok) {
        // Frame might not have detections, which is normal
        setFrameData(null)
        setError(null)
        return
      }
      
      const data = await response.json()
      setFrameData(data)
    } catch (err) {
      console.error('Failed to fetch frame detections:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch frame detections')
      setFrameData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFrameData()
  }, [logFilename, frameNumber])

  return { frameData, loading, error, refetch: fetchFrameData }
}

/**
 * Hook for fetching detection range data
 */
export function useDetectionRange(
  logFilename: string | null,
  startFrame: number = 0,
  endFrame?: number,
  limit: number = 1000
) {
  const [detections, setDetections] = useState<FrameDetectionData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetections = async () => {
    if (!logFilename) {
      setDetections([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        start_frame: startFrame.toString(),
        limit: limit.toString()
      })
      
      if (endFrame !== undefined) {
        params.append('end_frame', endFrame.toString())
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/detection-logs/detection-logs/${logFilename}/detections?${params}`
      )
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setDetections(data)
    } catch (err) {
      console.error('Failed to fetch detection range:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch detection range')
      setDetections([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetections()
  }, [logFilename, startFrame, endFrame, limit])

  return { detections, loading, error, refetch: fetchDetections }
}