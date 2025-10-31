"use client"
import { useState, useEffect } from "react"

export interface PersonalStat {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: any
  color: string
  description: string
}

export interface DailyPerformance {
  date: string
  processed: number
  assigned: number
  avgTime: number
}

export interface ViolationTypeStat {
  name: string
  processed: number
  color: string
}

export interface MonthlyComparison {
  month: string
  thisYear: number
  lastYear: number
}

export interface RecentActivity {
  date: string
  activity: string
  type: "success" | "highlight"
}

export interface OfficerStats {
  personalStats: PersonalStat[]
  dailyPerformance: DailyPerformance[]
  violationTypeStats: ViolationTypeStat[]
  monthlyComparison: MonthlyComparison[]
  recentActivities: RecentActivity[]
}

export function useOfficerStats() {
  const [data, setData] = useState<OfficerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('access_token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/officer/dashboard/stats`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) throw new Error("Không thể tải dữ liệu thống kê")
        const json: OfficerStats = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
