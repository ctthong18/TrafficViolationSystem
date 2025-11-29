"use client"
import { useState, useEffect } from "react"
import { dashboardApi, DashboardStat, RecentViolation, SystemActivity } from "@/lib/api"

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await dashboardApi.getAdminStats()
        
        // Transform backend data to frontend format
        const formattedStats: DashboardStat[] = [
          {
            title: "Tổng người dùng",
            value: data.total_users.toString(),
            change: "+0%",
            icon: "up",
            color: "text-primary"
          },
          {
            title: "Cán bộ",
            value: data.total_officers.toString(),
            change: "+0%",
            icon: "stable",
            color: "text-blue-500"
          },
          {
            title: "Công dân",
            value: data.total_citizens.toString(),
            change: "+0%",
            icon: "up",
            color: "text-green-500"
          },
          {
            title: "Trạng thái hệ thống",
            value: data.system_health === "normal" ? "Bình thường" : data.system_health,
            change: "Hoạt động tốt",
            icon: "stable",
            color: "text-success"
          }
        ]
        
        setStats(formattedStats)
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err)
        const errorMessage = err?.message || err?.toString() || "Không thể tải dữ liệu thống kê"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

export function useRecentViolations(limit: number = 10) {
  const [violations, setViolations] = useState<RecentViolation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Ensure limit is a number and within valid range (1-50)
        const numericLimit = parseInt(String(limit), 10)
        const validLimit = isNaN(numericLimit) ? 10 : Math.max(1, Math.min(50, numericLimit))

        
        const data = await dashboardApi.getRecentViolations(validLimit)
        setViolations(Array.isArray(data) ? data : [])
      } catch (err: any) {
        console.error("Error fetching recent violations:", err)
        const errorMessage = err?.message || err?.toString() || "Không thể tải dữ liệu vi phạm"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchViolations()
  }, [limit])

  return { violations, loading, error }
}

export function useRecentActivities(limit: number = 10) {
  const [activities, setActivities] = useState<SystemActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await dashboardApi.getRecentActivities(limit)
        setActivities(data)
      } catch (err: any) {
        console.error("Error fetching recent activities:", err)
        const errorMessage = err?.message || err?.toString() || "Không thể tải dữ liệu hoạt động"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [limit])

  return { activities, loading, error }
}
