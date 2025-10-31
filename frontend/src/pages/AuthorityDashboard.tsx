"use client"

import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  Camera,
  AlertTriangle,
  Users,
  BarChart3,
  TrendingUp,
  Eye,
} from "lucide-react"
import { CameraSystem } from "../../components/camera-system"
import ViolationManagement from "../../components/violation-management/ViolationManagement"
import { StatisticsPanel } from "../../components/statistics/StatisticsPanel"
import { OfficerManagement } from "../../components/officer-management/OfficerManagement"
import Header from "../components/Header"

type Stat = {
  title: string
  value: string
  change: string
  icon: any
  color: string
}

type Violation = {
  id: string
  type: string
  location: string
  time: string
  status: "pending" | "processed"
}

type Activity = {
  action: string
  time: string
  type: "violation" | "process" | "report" | "system"
}

export default function AuthorityDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<Stat[]>([])
  const [recentViolations, setRecentViolations] = useState<Violation[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // const router = useRouter()
  // removed unused handleLogout

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, violationsRes, activitiesRes] = await Promise.all([
        fetch("/api/v1/dashboard/stats"),
        fetch("/api/v1/dashboard/recent-violations"),
        fetch("/api/v1/dashboard/activities"),
      ])

      if (!statsRes.ok) throw new Error("Failed to fetch stats")
      if (!violationsRes.ok) throw new Error("Failed to fetch recent violations")
      if (!activitiesRes.ok) throw new Error("Failed to fetch activities")

      const statsData: Stat[] = await statsRes.json()
      const violationsData: Violation[] = await violationsRes.json()
      const activitiesData: Activity[] = await activitiesRes.json()

      setStats(statsData)
      setRecentViolations(violationsData)
      setActivities(activitiesData)
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
      <Header />

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Tổng quan
            </TabsTrigger>
            <TabsTrigger value="cameras" className="flex items-center gap-2">
              <Camera className="h-4 w-4" /> Hệ thống camera
            </TabsTrigger>
            <TabsTrigger value="violations" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Vi phạm
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Thống kê
            </TabsTrigger>
            <TabsTrigger value="officers" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Quản lý cán bộ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {loading && <p>Đang tải dữ liệu dashboard...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat, index) => (
                    <Card key={index}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                          <span
                            className={stat.change.startsWith("+") ? "text-success" : "text-warning"}
                          >
                            {stat.change}
                          </span>{" "}
                          so với hôm qua
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Vi phạm gần đây</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentViolations.map((violation) => (
                          <div
                            key={violation.id}
                            className="flex items-center justify-between p-3 border border-border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{violation.id}</span>
                                <Badge
                                  variant={violation.status === "processed" ? "default" : "secondary"}
                                >
                                  {violation.status === "processed" ? "Đã xử lý" : "Chờ xử lý"}
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

                  <Card>
                    <CardHeader>
                      <CardTitle>Hoạt động hệ thống</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activities.map((activity, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                activity.type === "violation"
                                  ? "bg-warning"
                                  : activity.type === "process"
                                  ? "bg-success"
                                  : activity.type === "report"
                                  ? "bg-primary"
                                  : "bg-destructive"
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
              </>
            )}
          </TabsContent>

          <TabsContent value="cameras">
            <CameraSystem />
          </TabsContent>

          <TabsContent value="violations">
            <ViolationManagement />
          </TabsContent>

          <TabsContent value="statistics">
            <StatisticsPanel />
          </TabsContent>

          <TabsContent value="officers">
            <OfficerManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
