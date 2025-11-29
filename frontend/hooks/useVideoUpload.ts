"use client"

import { useState } from "react"
import { videoApi, VideoUploadResponse } from "@/lib/api"

interface UseVideoUploadReturn {
  upload: (params: {
    file: File
    camera_id: number
    recorded_at?: string
  }) => Promise<VideoUploadResponse>
  loading: boolean
  progress: number
  error: string | null
  success: VideoUploadResponse | null
  reset: () => void
}

export function useVideoUpload(): UseVideoUploadReturn {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<VideoUploadResponse | null>(null)

  const upload = async (params: {
    file: File
    camera_id: number
    recorded_at?: string
  }): Promise<VideoUploadResponse> => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const result = await videoApi.upload(params)
      
      clearInterval(progressInterval)
      setProgress(100)
      setSuccess(result)
      
      return result
    } catch (err: any) {
      setError(err.message || 'Failed to upload video')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setLoading(false)
    setProgress(0)
    setError(null)
    setSuccess(null)
  }

  return {
    upload,
    loading,
    progress,
    error,
    success,
    reset
  }
}

// Hook for analyzing a video
export function useVideoAnalysis() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeVideo = async (videoId: number) => {
    setLoading(true)
    setError(null)

    try {
      const result = await videoApi.analyze(videoId)
      return result
    } catch (err: any) {
      setError(err.message || 'Failed to analyze video')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    analyzeVideo,
    loading,
    error
  }
}