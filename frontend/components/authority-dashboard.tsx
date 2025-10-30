"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Shield,
  LogOut,
  Eye,
  TrendingUp,
} from "lucide-react"
import { CameraSystem } from "@/components/camera-system"
import { ViolationManagement } from "@/components/violation-management"
import { StatisticsPanel } from "@/components/statistics-panel"
import { OfficerManagement } from "@/components/officer-management"

export function AuthorityDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const handleLogout = () => {
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  const stats = [
    {
      title: "Tổng vi phạm hôm nay",
      value: "247",
      change: "+12%",
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      title: "Đã xử lý",
      value: "189",
      change: "+8%",
      icon: CheckCircle,
      color: "text-success",
    },
    {
      title: "Chờ xử lý",
      value: "58",
      change: "-5%",
      icon: Clock,
      color: "text-primary",
    },
    {
      title: "Camera hoạt động",
      value: "142/150",
      change: "95%",
      icon: Camera,
      color: "text-success",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Hệ thống Phạt Nguội</h1>
                <p className="text-sm text-muted-foreground">Cơ quan có thẩm quyền</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="cameras" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Hệ thống camera
            </TabsTrigger>
            <TabsTrigger value="violations" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Vi phạm
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Thống kê
            </TabsTrigger>
            <TabsTrigger value="officers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Quản lý cán bộ
            </TabsTrigger>
          </TabsList>

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
                    <p className="text-xs text-muted-foreground">
                      <span className={stat.change.startsWith("+") ? "text-success" : "text-warning"}>
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
                    {[
                      {
                        id: "VL001",
                        type: "Vượt đèn đỏ",
                        location: "Ngã tư Láng Hạ",
                        time: "14:30",
                        status: "pending",
                      },
                      {
                        id: "VL002",
                        type: "Quá tốc độ",
                        location: "Đại lộ Thăng Long",
                        time: "14:25",
                        status: "processed",
                      },
                      {
                        id: "VL003",
                        type: "Không đội mũ bảo hiểm",
                        location: "Phố Huế",
                        time: "14:20",
                        status: "pending",
                      },
                    ].map((violation) => (
                      <div
                        key={violation.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{violation.id}</span>
                            <Badge variant={violation.status === "processed" ? "default" : "secondary"}>
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
                    {[
                      { action: "Camera CAM-001 phát hiện vi phạm", time: "2 phút trước", type: "violation" },
                      { action: "Cán bộ Nguyễn Văn A xử lý vi phạm VL-089", time: "5 phút trước", type: "process" },
                      {
                        action: "Báo cáo từ người dân về vi phạm tại Hoàn Kiếm",
                        time: "10 phút trước",
                        type: "report",
                      },
                      { action: "Camera CAM-045 offline", time: "15 phút trước", type: "system" },
                    ].map((activity, index) => (
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
