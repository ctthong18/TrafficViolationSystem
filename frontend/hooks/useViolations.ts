"use client"
import { useEffect, useState } from "react"
import { violationsApi, citizenApi, Violation } from "@/lib/api"

export interface Report {
  id: string
  type: string
  location: string
  time: string
  reporter: string
  status: "reviewing" | "verified"
  description: string
}

// Re-export Violation type from api
export type { Violation }

export function useViolations() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [violationsData, reportsData] = await Promise.all([
          violationsApi.getAll({ limit: 100 }).catch(err => {
            console.error("Lỗi khi tải violations:", err)
            return { violations: [], total: 0, page: 1, size: 0 }
          }),
          citizenApi.getMyReports().catch(err => {
            console.error("Lỗi khi tải reports:", err)
            return []
          }),
        ])

        setViolations(violationsData.violations || [])
        // Map complaints to reports format if needed
        const reportsArray = Array.isArray(reportsData) ? reportsData : []
        setReports(reportsArray.map((r: any) => ({
          id: r.id?.toString() || '',
          type: r.complaint_type || r.type || '',
          location: r.location || '',
          time: r.created_at || '',
          reporter: r.complainant_name || '',
          status: r.status === 'resolved' ? 'verified' : 'reviewing',
          description: r.description || r.title || '',
        })))
      } catch (err: any) { 
        console.error("Lỗi tải dữ liệu:", err)
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu') 
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { violations, reports, loading, error }
}

export function useCitizenViolations() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchViolations = async () => {
    try {
      setLoading(true)
      const data = await citizenApi.getMyViolations()
      setViolations(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchViolations()
  }, [])

  return { violations, loading, error, refetch: fetchViolations }
}

export async function fetchViolationsByLicense(license: string): Promise<Violation[]> {
  return violationsApi.lookupByLicensePlate(license)
}

export async function fetchViolationById(id: string): Promise<Violation[]> {
  try {
    const violation = await violationsApi.getById(id)
    return [violation]
  } catch (error) {
    return []
  }
}