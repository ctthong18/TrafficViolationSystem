"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Search, FileText, User, CreditCard, Shield, LogOut, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import ViolationLookup from "../components/ViolationLookup"
import ViolationReport from "../components/ViolationReport"
import { CitizenProfile } from "../../components/citizen-profile";
import { PaymentGuide } from "../../components/payment-guide";

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState("lookup")
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("user")
  router.push("/")
}

  const stats = [
    {
      title: "Vi phạm chưa thanh toán",
      value: "2",
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      title: "Đã thanh toán",
      value: "5",
      icon: CheckCircle,
      color: "text-success",
    },
    {
      title: "Báo cáo đã gửi",
      value: "1",
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Đang xử lý",
      value: "1",
      icon: Clock,
      color: "text-muted-foreground",
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
                <p className="text-sm text-muted-foreground">Cổng thông tin người dân</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">Nguyễn Văn B</span>
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
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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

          <TabsContent value="lookup">
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
