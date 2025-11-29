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

// Backend response interfaces
interface BackendUser {
  id: number
  username: string
  email: string
  full_name: string
  role: string
  badge_number?: string
  department?: string
  phone_number?: string
  is_active: boolean
  last_login?: string
  created_at: string
}

interface UserListResponse {
  users: BackendUser[]
  total: number
  page: number
  size: number
}

// Transform backend user to frontend Officer
const transformToOfficer = (user: BackendUser): Officer => ({
  id: user.id.toString(),
  name: user.full_name,
  email: user.email,
  phone: user.phone_number || "N/A",
  department: user.department || "N/A",
  position: user.badge_number || "Officer",
  status: user.is_active ? "active" : "inactive",
  assignedCases: 0,  // TODO: Get from backend
  completedCases: 0, // TODO: Get from backend
  joinDate: new Date(user.created_at).toLocaleDateString('vi-VN'),
  lastLogin: user.last_login ? new Date(user.last_login).toLocaleDateString('vi-VN') : "Chưa đăng nhập"
})

export function useOfficers() {
  const [officers, setOfficers] = useState<Officer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const token = localStorage.getItem('access_token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/users?role=officer`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        
        const data = await res.json()
        
        // Validate response structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format')
        }
        
        // Handle paginated response structure
        if ('users' in data && Array.isArray(data.users)) {
          const response = data as UserListResponse
          const transformedOfficers = response.users.map(transformToOfficer)
          setOfficers(transformedOfficers)
        } else if (Array.isArray(data)) {
          // Fallback: handle direct array response for backward compatibility
          const transformedOfficers = data.map(transformToOfficer)
          setOfficers(transformedOfficers)
        } else {
          throw new Error('Unexpected response structure')
        }
      } catch (err: any) {
        console.error("Error fetching officers:", err)
        setError(err?.message || "Không thể tải dữ liệu cán bộ")
        setOfficers([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchOfficers()
  }, [])

  return { officers, loading, error }
}
