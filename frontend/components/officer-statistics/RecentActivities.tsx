"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Award } from "lucide-react"
import { RecentActivity } from "@/hooks/useOfficerStats"

interface Props {
  activities: RecentActivity[]
}

export function RecentActivities({ activities = []}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử hoạt động gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <div className={`w-2 h-2 rounded-full ${item.type === "highlight" ? "bg-warning" : "bg-success"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.activity}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
              {item.type === "highlight" && <Award className="h-4 w-4 text-warning" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
