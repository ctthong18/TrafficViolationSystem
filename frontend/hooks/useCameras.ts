"use client"
import { useState, useEffect } from "react"
import { cameraApi, Camera, CameraListResponse } from "@/lib/api"

export function useCameras(params?: {
  skip?: number
  limit?: number
  status?: string
  search?: string
}) {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCameras = async () => {
    try {
      setLoading(true)
      setError(null)
      const response: CameraListResponse = await cameraApi.getAll(params)
      setCameras(response.items || [])
      setTotal(response.total || 0)
    } catch (err: any) {
      console.error("Error fetching cameras:", err)
      const errorMessage = err?.message || err?.toString() || "Không thể tải dữ liệu camera"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCameras()
  }, [params?.skip, params?.limit, params?.status, params?.search])

  return { cameras, total, loading, error, refetch: fetchCameras }
}

export function useCamera(cameraId: string) {
  const [camera, setCamera] = useState<Camera | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCamera = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await cameraApi.getById(cameraId)
        setCamera(data)
      } catch (err: any) {
        console.error("Error fetching camera:", err)
        const errorMessage = err?.message || err?.toString() || "Không thể tải thông tin camera"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (cameraId) {
      fetchCamera()
    }
  }, [cameraId])

  return { camera, loading, error }
}
