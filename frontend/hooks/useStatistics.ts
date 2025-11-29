"use client"
import { useState, useEffect } from "react"
import { dashboardApi, StatisticsData } from "@/lib/api"

export function useStatistics(timeRange: '7days' | '30days' | '3months' | 'year' = '7days') {
  const [data, setData] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true)
        setError(null)
        const statistics = await dashboardApi.getStatistics(timeRange)
        setData(statistics)
      } catch (err: any) {
        console.error("Error fetching statistics:", err)
        const errorMessage = err?.message || err?.toString() || "Không thể tải dữ liệu thống kê"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [timeRange])

  return { data, loading, error }
}
