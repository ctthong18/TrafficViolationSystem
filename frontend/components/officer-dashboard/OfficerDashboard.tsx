"use client"

import { useState } from "react"
import { 
  Camera, AlertTriangle, BarChart3, TrendingUp, Bell, LogOut,
  ClipboardList, CheckCircle, XCircle, Clock
} from "lucide-react"
import { CameraSystem } from "@/components/camera-system/CameraSystem"
import OfficerViolationManagement from "@/components/officer-violation-management/OfficerViolationManagement"
import { OfficerStatistics } from "@/components/officer-statistics/OfficerStatistics"
import { OverviewStats } from "@/components/officer-dashboard/OverviewStats"
import { OverviewViolations } from "@/components/officer-dashboard/OverviewViolations"
import { OverviewActivity } from "@/components/officer-dashboard/OverviewActivity"

export default function OfficerDashboard() {
  const [mainTab, setMainTab] = useState("overview")
  const [subTab, setSubTab] = useState("pending")

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
    window.location.href = "/login"
  }

  const mainTabs = [
    { id: "overview", label: "Tổng quan", icon: BarChart3 },
    { id: "violations", label: "Quản lý vi phạm", icon: AlertTriangle },
    { id: "cameras", label: "Hệ thống camera", icon: Camera },
    { id: "statistics", label: "Thống kê", icon: TrendingUp },
  ]

  const violationSubTabs = [
    { id: "pending", label: "Chờ xử lý", icon: Clock },
    { id: "reviewing", label: "Đang xem xét", icon: ClipboardList },
    { id: "approved", label: "Đã duyệt", icon: CheckCircle },
    { id: "rejected", label: "Từ chối", icon: XCircle },
  ]

  const getMainTabContent = () => {
    switch (mainTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <OverviewStats />
            <div className="grid gap-6 md:grid-cols-2">
              <OverviewViolations />
              <OverviewActivity />
            </div>
          </div>
        )
      
      case "violations":
        return null // Handled by sidebar
      
      case "cameras":
        return <CameraSystem />
      
      case "statistics":
        return <OfficerStatistics />
      
      default:
        return null
    }
  }

  const getViolationSubTabContent = () => {
    if (mainTab !== "violations") return null
    
    // Pass filter to OfficerViolationManagement based on subTab
    return <OfficerViolationManagement filter={subTab} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Tabs - Horizontal */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="text-xl font-bold text-primary">GTVT Officer</div>
              <div className="flex items-center gap-1">
                {mainTabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setMainTab(tab.id)
                        if (tab.id === "violations") setSubTab("pending")
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
            <div className="flex items-center gap-4">
              <button className="text-muted-foreground hover:text-foreground">
                <Bell size={20} />
              </button>
              <button 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive flex items-center gap-2"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area with Conditional Sidebar */}
      <div className="flex">
        {/* Left Sidebar - Only show for violations tab */}
        {mainTab === "violations" && (
          <div className="w-64 border-r min-h-[calc(100vh-4rem)] bg-muted/30">
            <div className="p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Quản Lý Vi Phạm
              </h3>
              <nav className="space-y-1">
                {violationSubTabs.map((tab) => {
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
          <div className="container mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">
                {mainTab === "overview" && "Tổng quan"}
                {mainTab === "violations" && "Quản lý vi phạm"}
                {mainTab === "cameras" && "Hệ thống camera"}
                {mainTab === "statistics" && "Thống kê"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mainTab === "overview" && "Xem tổng quan hoạt động và thống kê"}
                {mainTab === "violations" && subTab === "pending" && "Danh sách vi phạm chờ xử lý"}
                {mainTab === "violations" && subTab === "reviewing" && "Danh sách vi phạm đang xem xét"}
                {mainTab === "violations" && subTab === "approved" && "Danh sách vi phạm đã duyệt"}
                {mainTab === "violations" && subTab === "rejected" && "Danh sách vi phạm đã từ chối"}
                {mainTab === "cameras" && "Quản lý và giám sát hệ thống camera"}
                {mainTab === "statistics" && "Thống kê hiệu suất và hoạt động cá nhân"}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {mainTab === "violations" ? getViolationSubTabContent() : getMainTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}