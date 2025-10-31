"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface Activity {
  action: string
  time: string
  type: "violation" | "process" | "report" | "system"
}

export function SystemActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/recent`)
        if (!res.ok) throw new Error("Không thể tải dữ liệu hoạt động")
        const data: Activity[] = await res.json()
        setActivities(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [])

  if (loading) return <p>Đang tải hoạt động...</p>
  if (error) return <p className="text-destructive">{error}</p>

  const getColor = (type: string) => {
    switch (type) {
      case "violation": return "bg-warning"
      case "process": return "bg-success"
      case "report": return "bg-primary"
      default: return "bg-destructive"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động hệ thống</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getColor(activity.type)}`} />
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
