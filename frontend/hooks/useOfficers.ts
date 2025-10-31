"use client"
import { useState, useEffect } from "react"

export interface Officer {
  id: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  status: "active" | "inactive" | "suspended"
  assignedCases: number
  completedCases: number
  joinDate: string
  lastLogin: string
}

export function useOfficers() {
  const [officers, setOfficers] = useState<Officer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('access_token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users?role=officer`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) throw new Error("Không thể tải dữ liệu cán bộ")
        const data: Officer[] = await res.json()
        setOfficers(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOfficers()
  }, [])

  return { officers, loading, error }
}
