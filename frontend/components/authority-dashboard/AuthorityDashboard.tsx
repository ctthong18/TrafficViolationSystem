"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header  from "../../src/components/Header"
import { OverviewStats } from "./OverviewStats"
import { RecentViolations } from "./RecentViolations"
import { SystemActivity } from "./SystemActivity"
import { CameraSystem } from "@/components/camera-system/CameraSystem"
import ViolationManagement  from "@/components/violation-management/ViolationManagement"
import { StatisticsPanel } from "@/components/statistics/StatisticsPanel"
import { OfficerManagement } from "@/components/officer-management/OfficerManagement"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="cameras">Hệ thống camera</TabsTrigger>
            <TabsTrigger value="violations">Vi phạm</TabsTrigger>
            <TabsTrigger value="statistics">Thống kê</TabsTrigger>
            <TabsTrigger value="officers">Quản lý cán bộ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewStats />
            <div className="grid gap-6 md:grid-cols-2">
              <RecentViolations />
              <SystemActivity />
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
