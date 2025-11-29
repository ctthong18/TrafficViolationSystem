"use client"

import { useState, useEffect } from "react"
import { detectionApi, AIDetection } from "@/lib/api"

interface UseDetectionsParams {
  camera_id?: number
  violation_type?: string
  min_confidence?: number
  date_from?: string
  date_to?: string
  skip?: number
  limit?: number
}

interface UseDetectionsReturn {
  detections: AIDetection[]
  total: number
  page: number
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDetections(params: UseDetectionsParams = {}): UseDetectionsReturn {
  const [detections, setDetections] = useState<AIDetection[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDetections = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await detectionApi.getPending(params)
      setDetections(response.detections)
      setTotal(response.total)
      setPage(response.page)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch detections')
      console.error('Error fetching detections:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetections()
  }, [
    params.camera_id,
    params.violation_type,
    params.min_confidence,
    params.date_from,
    params.date_to,
    params.skip,
    params.limit
  ])

  return {
    detections,
    total,
    page,
    loading,
    error,
    refetch: fetchDetections
  }
}

// Hook for reviewing a single detection
export function useDetectionReview() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reviewDetection = async (
    detectionId: number,
    action: "approve" | "reject" | "modify",
    notes?: string,
    modifiedData?: Record<string, any>
  ) => {
    setLoading(true)
    setError(null)

    try {
      const response = await detectionApi.review(detectionId, {
        action,
        notes,
        modified_data: modifiedData
      })
      
      return response
    } catch (err: any) {
      setError(err.message || 'Failed to review detection')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    reviewDetection,
    loading,
    error
  }
}

// Hook for getting detections for a specific video
export function useVideoDetections(videoId: number, params?: {
  detection_type?: string
  min_confidence?: number
}) {
  const [detections, setDetections] = useState<AIDetection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideoDetections = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await detectionApi.getByVideoId(videoId, params)
        setDetections(response.detections)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch video detections')
        console.error('Error fetching video detections:', err)
      } finally {
        setLoading(false)
      }
    }

    if (videoId) {
      fetchVideoDetections()
    }
  }, [videoId, params?.detection_type, params?.min_confidence])

  return {
    detections,
    loading,
    error
  }
}