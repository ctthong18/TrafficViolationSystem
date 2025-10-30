"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileText, User, CreditCard, Shield, LogOut, AlertTriangle, CheckCircle } from "lucide-react"
import { ViolationLookup } from "@/components/violation-lookup"
import { ViolationReport } from "@/components/violation-report"
import { CitizenProfile } from "@/components/citizen-profile"
import { PaymentGuide } from "@/components/payment-guide"

export function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState("lookup")

  const handleLogout = () => {
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  // Mock data for citizen's violations
  const myViolations = [
    {
      id: "VL-001",
      type: "Vượt đèn đỏ",
      location: "Ngã tư Láng Hạ",
      time: "14:30 - 15/12/2024",
      licensePlate: "30A-12345",
      status: "unpaid",
      fine: "1,000,000 VNĐ",
      dueDate: "29/12/2024",
      evidence: "CAM-001_20241215_1430.jpg",
    },
    {
      id: "VL-045",
      type: "Đỗ xe sai quy định",
      location: "Phố Bà Triệu",
      time: "10:30 - 10/12/2024",
      licensePlate: "30A-12345",
      status: "paid",
      fine: "300,000 VNĐ",
      paidDate: "12/12/2024",
      evidence: "Báo cáo từ người dân",
    },
  ]

  const stats = [
    {
      title: "Vi phạm chưa thanh toán",
      value: myViolations.filter((v) => v.status === "unpaid").length.toString(),
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      title: "Vi phạm đã thanh toán",
      value: myViolations.filter((v) => v.status === "paid").length.toString(),
      icon: CheckCircle,
      color: "text-success",
    },
    {
      title: "Tổng số tiền phạt chưa thanh toán",
      value:
        myViolations
          .filter((v) => v.status === "unpaid")
          .reduce((sum, v) => sum + Number.parseInt(v.fine.replace(/[^\d]/g, "")), 0)
          .toLocaleString("vi-VN") + " VNĐ",
      icon: CreditCard,
      color: "text-destructive",
    },
    {
      title: "Báo cáo đã gửi",
      value: "3",
      icon: FileText,
      color: "text-primary",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unpaid":
        return <Badge className="bg-warning text-warning-foreground">Chưa thanh toán</Badge>
      case "paid":
        return <Badge className="bg-success text-success-foreground">Đã thanh toán</Badge>
      case "processing":
        return <Badge className="bg-primary text-primary-foreground">Đang xử lý</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

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
                <p className="text-sm text-muted-foreground">Dành cho người dân</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Nguyễn Văn C</p>
                <p className="text-xs text-muted-foreground">Người dân</p>
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
            <TabsTrigger value="lookup" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Tra cứu vi phạm
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Báo cáo vi phạm
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Thông tin cá nhân
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Hướng dẫn nộp phạt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lookup" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Violations */}
            <Card>
              <CardHeader>
                <CardTitle>Vi phạm gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myViolations.map((violation) => (
                    <div
                      key={violation.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{violation.id}</span>
                          {getStatusBadge(violation.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{violation.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {violation.location} • {violation.time}
                        </p>
                        <p className="text-xs text-muted-foreground">Biển số: {violation.licensePlate}</p>
                        {violation.status === "unpaid" && (
                          <p className="text-xs text-destructive">Hạn nộp: {violation.dueDate}</p>
                        )}
                        {violation.status === "paid" && (
                          <p className="text-xs text-success">Đã thanh toán: {violation.paidDate}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${
                            violation.status === "unpaid" ? "text-destructive" : "text-success"
                          }`}
                        >
                          {violation.fine}
                        </p>
                        {violation.status === "unpaid" && (
                          <Button size="sm" className="mt-2">
                            Thanh toán
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <ViolationLookup />
          </TabsContent>

          <TabsContent value="report">
            <ViolationReport />
          </TabsContent>

          <TabsContent value="profile">
            <CitizenProfile />
          </TabsContent>

          <TabsContent value="payment">
            <PaymentGuide />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
