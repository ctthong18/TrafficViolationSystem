"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PersonalStat } from "@/hooks/useOfficerStats"

import { CheckCircle, XCircle, Clock, ListChecks, TrendingUp } from "lucide-react"

export function OverviewStats() {
  const [stats, setStats] = useState<PersonalStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("access_token")

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/officer/dashboard/stats`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        )

        if (!res.ok) throw new Error("Không thể tải thống kê")

        const data = await res.json()
        console.log("API data:", data)

        const statsArray: PersonalStat[] = [
          {
            title: "Tổng hồ sơ đã xử lý",
            value: data.total_reviewed,
            icon: ListChecks,
            color: "text-blue-500",
            change: "0",
            trend: "neutral",
            description: "Tổng số hồ sơ đã hoàn tất",
          },
          {
            title: "Phê duyệt hôm nay",
            value: data.approved_today,
            icon: CheckCircle,
            color: "text-green-500",
            change: "0",
            trend: "neutral",
            description: "Số hồ sơ được phê duyệt trong hôm nay",
          },
          {
            title: "Từ chối hôm nay",
            value: data.rejected_today,
            icon: XCircle,
            color: "text-red-500",
            change: "0",
            trend: "neutral",
            description: "Số hồ sơ bị từ chối hôm nay",
          },
          {
            title: "Đang chờ duyệt",
            value: data.pending_reviews,
            icon: Clock,
            color: "text-yellow-500",
            change: "0",
            trend: "neutral",
            description: "Hồ sơ đang chờ xử lý",
          },
          {
            title: "Tỉ lệ hiệu suất (%)",
            value: data.efficiency_rate,
            icon: TrendingUp,
            color: "text-purple-500",
            change: "0",
            trend: "neutral",
            description: "Hiệu suất xử lý công việc",
          },
          {
            title: "Thời gian xử lý trung bình (phút)",
            value: data.average_processing_time,
            icon: Clock,
            color: "text-gray-500",
            change: "0",
            trend: "neutral",
            description: "Thời gian xử lý hồ sơ trung bình",
          },
        ]

        setStats(statsArray)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <p>Đang tải thống kê...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>

            {stat.change && (
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {stat.change}
                </span>{" "}
                so với hôm qua
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
