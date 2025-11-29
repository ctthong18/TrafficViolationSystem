"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Officer } from "@/hooks/useOfficers"
import { UserX } from "lucide-react"

interface Props {
  officers: Officer[]
}

export function OfficerPerformance({ officers }: Props) {
  // Handle empty or undefined officers array
  const safeOfficers = Array.isArray(officers) ? officers : []
  
  // Show empty state if no officers
  if (safeOfficers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <UserX className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Chưa có dữ liệu cán bộ</p>
          <p className="text-sm text-muted-foreground mt-2">Vui lòng thêm cán bộ để xem thống kê hiệu suất</p>
        </CardContent>
      </Card>
    )
  }

  const totalOfficers = safeOfficers.length
  const activeOfficers = safeOfficers.filter((o) => o.status === "active").length

  const topOfficers = [...safeOfficers]
    .sort((a, b) => (b.completedCases || 0) - (a.completedCases || 0))
    .slice(0, 3)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Top officers */}
      <Card>
        <CardHeader>
          <CardTitle>Top cán bộ hiệu suất cao</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topOfficers.length > 0 ? (
            topOfficers.map((officer, index) => (
              <div key={officer.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? "bg-yellow-500 text-white" :
                    index === 1 ? "bg-gray-400 text-white" :
                    "bg-orange-600 text-white"
                  }`}>{index+1}</div>
                  <div>
                    <p className="font-medium">{officer.name || "Không có tên"}</p>
                    <p className="text-sm text-muted-foreground">{officer.position || "Không có chức vụ"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">{officer.completedCases || 0}</p>
                  <p className="text-sm text-muted-foreground">vụ hoàn thành</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Chưa có dữ liệu hiệu suất</p>
            </div>
          )}
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
