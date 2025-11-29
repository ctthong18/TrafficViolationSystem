"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RecentActivity } from "@/hooks/useOfficerStats" // Import từ file types

export function OverviewActivity() {
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('access_token')
        // Giả sử đây là endpoint mới chỉ để lấy hoạt động
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/officer/dashboard/activities`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) throw new Error("Không thể tải hoạt động")
        
        const data: RecentActivity[] = await res.json()
        setActivities(data) // Sử dụng dữ liệu
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [])

  if (loading) return <p>Đang tải hoạt động...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === "success"
                    ? "bg-green-500"
                    : activity.type === "new"
                    ? "bg-blue-500"
                    : "bg-yellow-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}