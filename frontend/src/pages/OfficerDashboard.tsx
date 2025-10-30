"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Shield,
  LogOut,
  Eye,
  TrendingUp,
  User,
} from "lucide-react"
import CameraSystem from "../components/CameraSystem"
import OfficerViolationManagement from "../components/OfficerViolationManagement"
import { OfficerStatistics } from "../../components/officer-statistics"

export default function OfficerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }
  const stats = [
    {
      title: "Vi phạm được phân công",
      value: "23",
      change: "+3",
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      title: "Đã xử lý hôm nay",
      value: "18",
      change: "+5",
      icon: CheckCircle,
      color: "text-success",
    },
    {
      title: "Chờ xử lý",
      value: "5",
      change: "-2",
      icon: Clock,
      color: "text-primary",
    },
    {
      title: "Hiệu suất",
      value: "92%",
      change: "+8%",
      icon: TrendingUp,
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
                <p className="text-sm text-muted-foreground">Cán bộ được phân công</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">Nguyễn Văn A</span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
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
                  <CardTitle>Vi phạm cần xử lý</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        id: "VL001",
                        type: "Vượt đèn đỏ",
                        location: "Ngã tư Láng Hạ",
                        time: "14:30",
                        priority: "high",
                      },
                      {
                        id: "VL005",
                        type: "Quá tốc độ",
                        location: "Đại lộ Thăng Long",
                        time: "13:45",
                        priority: "medium",
                      },
                      {
                        id: "VL008",
                        type: "Không đội mũ bảo hiểm",
                        location: "Phố Huế",
                        time: "12:20",
                        priority: "low",
                      },
                    ].map((violation) => (
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

              <Card>
                <CardHeader>
                  <CardTitle>Hoạt động gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Xử lý vi phạm VL-089 thành công", time: "10 phút trước", type: "success" },
                      { action: "Nhận vi phạm mới VL-091", time: "25 phút trước", type: "new" },
                      { action: "Cập nhật trạng thái vi phạm VL-087", time: "1 giờ trước", type: "update" },
                      { action: "Hoàn thành xử lý vi phạm VL-085", time: "2 giờ trước", type: "success" },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            activity.type === "success"
                              ? "bg-success"
                              : activity.type === "new"
                                ? "bg-primary"
                                : "bg-warning"
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

          <TabsContent value="violations">
            <OfficerViolationManagement />
          </TabsContent>

          <TabsContent value="cameras">
            <CameraSystem />
          </TabsContent>

          <TabsContent value="statistics">
            <OfficerStatistics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
