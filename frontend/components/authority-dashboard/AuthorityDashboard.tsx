"use client"

import { useState } from "react"
import { 
  BarChart3, Camera, AlertTriangle, TrendingUp, Users,
  UserCheck, UserX, UserPlus, Settings
} from "lucide-react"
import Header from "../../src/components/Header"
import { OverviewStats } from "./OverviewStats"
import { RecentViolations } from "./RecentViolations"
import { SystemActivity } from "./SystemActivity"
import { CameraSystem } from "@/components/camera-system/CameraSystem"
import ViolationManagement from "@/components/violation-management/ViolationManagement"
import { StatisticsPanel } from "@/components/statistics/StatisticsPanel"
import { OfficerManagement } from "@/components/officer-management/OfficerManagement"

export function AdminDashboard() {
  const [mainTab, setMainTab] = useState("overview")
  const [subTab, setSubTab] = useState("active")

  const mainTabs = [
    { id: "overview", label: "Tổng quan", icon: BarChart3 },
    { id: "cameras", label: "Hệ thống camera", icon: Camera },
    { id: "violations", label: "Vi phạm", icon: AlertTriangle },
    { id: "statistics", label: "Thống kê", icon: TrendingUp },
    { id: "officers", label: "Quản lý cán bộ", icon: Users },
  ]

  const officerSubTabs = [
    { id: "active", label: "Cán bộ hoạt động", icon: UserCheck },
    { id: "inactive", label: "Cán bộ ngừng hoạt động", icon: UserX },
    { id: "create", label: "Thêm cán bộ mới", icon: UserPlus },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ]

  const getMainTabContent = () => {
    switch (mainTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <OverviewStats />
            <div className="grid gap-6 md:grid-cols-2">
              <RecentViolations />
              <SystemActivity />
            </div>
          </div>
        )
      
      case "cameras":
        return <CameraSystem />
      
      case "violations":
        return <ViolationManagement />
      
      case "statistics":
        return <StatisticsPanel />
      
      case "officers":
        return null // Handled by sidebar
      
      default:
        return null
    }
  }

  const getOfficerSubTabContent = () => {
    if (mainTab !== "officers") return null
    
    return <OfficerManagement filter={subTab} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Top Tabs */}
        <div className="border-b mb-6">
          <div className="flex items-center gap-1">
            {mainTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setMainTab(tab.id)
                    if (tab.id === "officers") setSubTab("active")
                  }}
                  className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    mainTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Area with Conditional Sidebar */}
        <div className="flex gap-6">
          {/* Left Sidebar - Only show for officers tab */}
          {mainTab === "officers" && (
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Quản Lý Cán Bộ
                </h3>
                <nav className="space-y-1">
                  {officerSubTabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSubTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm ${
                          subTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {mainTab === "officers" ? getOfficerSubTabContent() : getMainTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
