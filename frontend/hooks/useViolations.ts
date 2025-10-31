"use client"
import { useEffect, useState } from "react"

export interface Violation {
  id: string
  type: string
  location: string
  time: string
  licensePlate: string
  status: "pending" | "processed" | "reviewing" | "verified" | "unpaid" | "paid" | "processing"
  officer?: string | null 
  fine: string
  dueDate?: string
  paidDate?: string
  evidence?: string
  description?: string
  priority?: "high" | "medium" | "low"
}

export interface Report {
  id: string
  type: string
  location: string
  time: string
  reporter: string
  status: "reviewing" | "verified"
  description: string
}

export function useViolations() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token") 
        if (!token) {
            setLoading(false); 
            return;
        }

        const [violationRes, reportRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/violations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/complaints`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (!violationRes.ok || !reportRes.ok)
          throw new Error("Không thể tải dữ liệu")

        setViolations(await violationRes.json())
        setReports(await reportRes.json())
      } catch (err: any) { 
        console.error("Lỗi tải dữ liệu:", err)
        setError(err.message) 
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

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("access_token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/citizen/my-violations`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        })
        if (!res.ok) throw new Error("Không thể tải dữ liệu vi phạm")
        const data: Violation[] = await res.json()
        setViolations(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchViolations()
  }, [])

  return { violations, loading, error }
}

export async function fetchViolationsByLicense(license: string): Promise<Violation[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/violations?license_plate=${encodeURIComponent(license)}`)
  if (!res.ok) throw new Error("Không thể tải dữ liệu")
  return res.json()
}

export async function fetchViolationById(id: string): Promise<Violation[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/violations/${id}`)
  if (!res.ok) throw new Error("Không thể tải dữ liệu")
  const data = await res.json()
  return Array.isArray(data) ? data : [data] 
}