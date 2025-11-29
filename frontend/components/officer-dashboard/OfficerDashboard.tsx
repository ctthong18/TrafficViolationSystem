"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, AlertTriangle, BarChart3, TrendingUp } from "lucide-react"
import { CameraSystem } from "@/components/camera-system/CameraSystem"
import OfficerViolationManagement from "@/components/officer-violation-management/OfficerViolationManagement"
import { OfficerStatistics } from "@/components/officer-statistics/OfficerStatistics"
import Header from "@/components/Header"

// Import các component con mới
import { OverviewStats } from "@/components/officer-dashboard/OverviewStats"
import { OverviewViolations } from "@/components/officer-dashboard/OverviewViolations"
import { OverviewActivity } from "@/components/officer-dashboard/OverviewActivity"

export default function OfficerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  // Đã xoá toàn bộ logic fetch dữ liệu, loading, error, và các state không cần thiết

  return (
    <div className="min-h-screen bg-background">
      <Header />

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

          {/* Tab Tổng quan giờ đây chỉ chứa 3 component con */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewStats />
            <div className="grid gap-6 md:grid-cols-2">
              <OverviewViolations />
              <OverviewActivity />
            </div>
          </TabsContent>

          {/* Các tab khác giữ nguyên */}
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