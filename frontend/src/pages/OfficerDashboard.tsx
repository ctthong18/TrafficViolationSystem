"use client"

import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, AlertTriangle, BarChart3, TrendingUp, Eye } from "lucide-react"
import { CameraSystem } from "@/components/camera-system"
import OfficerViolationManagement from "@/components/officer-violation-management/OfficerViolationManagement"
import { OfficerStatistics } from "@/components/officer-statistics/OfficerStatistics"
import Header from "@/components/Header"

type Stat = {
  title: string
  value: string
  change?: string
  icon: React.ElementType
  color: string
}

type Violation = {
  id: string
  type: string
  location: string
  time: string
  priority: "high" | "medium" | "low"
}

type Activity = {
  action: string
  time: string
  type: "success" | "new" | "warning"
}

export default function OfficerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<Stat[]>([])
  const [violations, setViolations] = useState<Violation[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // const router = useRouter()

  // removed unused handleLogout

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/officer/dashboard/stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) throw new Error("Không thể tải dữ liệu dashboard")
      await res.json()
      // shape unknown here; keep existing state minimal
      setStats([])
      setViolations([])
      setActivities([])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-6">
        {loading && <p>Đang tải dữ liệu...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="violations" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Vi phạm được phân công
              </TabsTrigger>
              <TabsTrigger value="cameras" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Hệ thống camera
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Thống kê cá nhân
              </TabsTrigger>
            </TabsList>

            {/* Tổng quan */}
            <TabsContent value="overview" className="space-y-6">
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
                          <span className={stat.change.startsWith("+") ? "text-green-600" : "text-yellow-600"}>
                            {stat.change}
                          </span>{" "}
                          so với hôm qua
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Danh sách vi phạm */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vi phạm cần xử lý</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {violations.map((violation) => (
                        <div
                          key={violation.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{violation.id}</span>
                              <Badge
                                variant={
                                  violation.priority === "high"
                                    ? "destructive"
                                    : violation.priority === "medium"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {violation.priority === "high"
                                  ? "Ưu tiên cao"
                                  : violation.priority === "medium"
                                  ? "Ưu tiên trung bình"
                                  : "Ưu tiên thấp"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{violation.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {violation.location} • {violation.time}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Hoạt động gần đây */}
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
              </div>
            </TabsContent>

            {/* Quản lý vi phạm */}
            <TabsContent value="violations">
              <OfficerViolationManagement />
            </TabsContent>

            {/* Camera */}
            <TabsContent value="cameras">
              <CameraSystem />
            </TabsContent>

            {/* Thống kê */}
            <TabsContent value="statistics">
              <OfficerStatistics />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
