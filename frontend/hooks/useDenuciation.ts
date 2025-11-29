"use client"

import { useState } from "react"
import { denunciationsApi, DenunciationResponse, DenunciationCreate } from "@/lib/api"

// Frontend Denunciation type (mapped from backend)
export interface Denunciation {
  id: string
  denunciation_code: string
  type: string
  title: string
  description: string
  location?: string
  reporter?: string
  status: "pending" | "verifying" | "investigating" | "resolved" | "rejected" | "transferred"
  severity_level: string
  urgency_level: string
  createdAt: string
  updatedAt: string
  is_anonymous: boolean
}

// Helper function to map backend denunciation to frontend format
const mapDenunciation = (d: DenunciationResponse): Denunciation => {
  return {
    id: d.id.toString(),
    denunciation_code: d.denunciation_code,
    type: d.denunciation_type,
    title: d.title,
    description: d.description,
    location: d.accused_department || undefined,
    reporter: d.informant_name || (d.is_anonymous ? 'Ẩn danh' : undefined),
    status: d.status as Denunciation['status'],
    severity_level: d.severity_level,
    urgency_level: d.urgency_level,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
    is_anonymous: d.is_anonymous,
  }
}

export interface DenunciationStats {
  total: number
  verified: number
  reviewing: number
  rejected: number
}

export function useDenunciations() {
  const [denunciations, setDenunciations] = useState<Denunciation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDenunciations = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await denunciationsApi.getAll({ limit: 100 })
      setDenunciations(data.denunciations.map(mapDenunciation))
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách tố cáo")
      console.error("Error fetching denunciations:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssignedDenunciations = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await denunciationsApi.getAssigned()
      setDenunciations(data.denunciations.map(mapDenunciation))
    } catch (err: any) {
      setError(err.message || "Không thể tải tố cáo được phân công")
      console.error("Error fetching assigned denunciations:", err)
    } finally {
      setLoading(false)
    }
  }

  const createDenunciation = async (payload: {
    type: string
    description: string
    location: string
    anonymous?: boolean
    title?: string
  }) => {
    try {
      const createPayload: DenunciationCreate = {
        title: payload.title || `Tố cáo ${payload.type}`,
        description: payload.description,
        denunciation_type: payload.type,
        is_anonymous: payload.anonymous ?? false,
        severity_level: "medium",
        urgency_level: "normal",
      }
      const data = await denunciationsApi.create(createPayload)
      setDenunciations((prev) => [mapDenunciation(data), ...prev])
      return mapDenunciation(data)
    } catch (err: any) {
      throw new Error(err.message || "Tạo tố cáo thất bại")
    }
  }

  const fetchDenunciationStats = async (startDate: string, endDate: string) => {
    try {
      const data = await denunciationsApi.getStats(startDate, endDate)
      return {
        total: data.total_denunciations,
        verified: data.by_status.resolved || 0,
        reviewing: (data.by_status.pending || 0) + (data.by_status.verifying || 0) + (data.by_status.investigating || 0),
        rejected: data.by_status.rejected || 0,
      } as DenunciationStats
    } catch (err: any) {
      throw new Error(err.message || "Không thể lấy thống kê tố cáo")
    }
  }

  return {
    denunciations,
    loading,
    error,
    fetchDenunciations,
    fetchAssignedDenunciations,
    createDenunciation,
    fetchDenunciationStats,
  }
}
