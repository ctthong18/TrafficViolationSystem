"use client"

import { useState, useEffect } from "react"
import { videoApi, VideoStatsResponse } from "@/lib/api"

interface UseVideoStatsParams {
  cameraId: number
  date_from?: string
  date_to?: string
}

interface UseVideoStatsReturn {
  stats: VideoStatsResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useVideoStats(params: UseVideoStatsParams): UseVideoStatsReturn {
  const [stats, setStats] = useState<VideoStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await videoApi.getStats(params)
      setStats(response)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch video statistics')
      console.error('Error fetching video stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.cameraId) {
      fetchStats()
    }
  }, [params.cameraId, params.date_from, params.date_to])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}