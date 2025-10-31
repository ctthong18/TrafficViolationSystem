"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Officer } from "@/hooks/useOfficers"

interface Props {
  officers: Officer[]
}

export function OfficerPerformance({ officers }: Props) {
  const totalOfficers = officers.length
  const activeOfficers = officers.filter((o) => o.status === "active").length
  const totalAssigned = officers.reduce((sum, o) => sum + o.assignedCases, 0)
  const totalCompleted = officers.reduce((sum, o) => sum + o.completedCases, 0)

  const topOfficers = [...officers].sort((a, b) => b.completedCases - a.completedCases).slice(0, 3)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Top officers */}
      <Card>
        <CardHeader>
          <CardTitle>Top cán bộ hiệu suất cao</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topOfficers.map((officer, index) => (
            <div key={officer.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? "bg-yellow-500 text-white" :
                  index === 1 ? "bg-gray-400 text-white" :
                  "bg-orange-600 text-white"
                }`}>{index+1}</div>
                <div>
                  <p className="font-medium">{officer.name}</p>
                  <p className="text-sm text-muted-foreground">{officer.position}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-success">{officer.completedCases}</p>
                <p className="text-sm text-muted-foreground">vụ hoàn thành</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Officer overview */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê tổng quan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 border border-border rounded-lg">
              <p className="text-2xl font-bold text-primary">{totalOfficers}</p>
              <p className="text-sm text-muted-foreground">Tổng cán bộ</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <p className="text-2xl font-bold text-success">{activeOfficers}</p>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
