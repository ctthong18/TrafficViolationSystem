import { useState, useEffect } from 'react'
import { videoApi, CameraVideo } from '@/lib/api'

export function useCameraLatestVideo(cameraId: number | null) {
  const [video, setVideo] = useState<CameraVideo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cameraId) {
      setVideo(null)
      return
    }

    const fetchLatestVideo = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Chỉ fetch video từ database qua API
        const response = await videoApi.getByCameraId({
          cameraId,
          limit: 1,
          skip: 0,
        })
        
        if (response.videos && response.videos.length > 0) {
          setVideo(response.videos[0])
        } else {
          setVideo(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch video')
        setVideo(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestVideo()
  }, [cameraId])

  return { video, loading, error }
}
