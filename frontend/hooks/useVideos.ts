import { useState, useEffect } from 'react'
import { videoApi, CameraVideo } from '@/lib/api'

interface UseVideosParams {
  cameraId: number
  skip?: number
  limit?: number
  has_violations?: boolean
  processing_status?: string
  date_from?: string
  date_to?: string
}

interface UseVideosReturn {
  videos: CameraVideo[]
  total: number
  page: number
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useVideos(params: UseVideosParams): UseVideosReturn {
  const [videos, setVideos] = useState<CameraVideo[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVideos = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await videoApi.getByCameraId({
        cameraId: params.cameraId,
        skip: params.skip,
        limit: params.limit,
        has_violations: params.has_violations,
        processing_status: params.processing_status,
        date_from: params.date_from,
        date_to: params.date_to,
      })
      setVideos(response.videos)
      setTotal(response.total)
      setPage(response.page)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch videos')
      console.error('Error fetching videos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [params.cameraId, params.skip, params.limit, params.has_violations, params.processing_status, params.date_from, params.date_to])

  return {
    videos,
    total,
    page,
    loading,
    error,
    refetch: fetchVideos
  }
}
