"use client"

import { useState } from "react"
import { 
  Camera, AlertTriangle, BarChart3, TrendingUp,
  ClipboardList, CheckCircle, XCircle, Clock
} from "lucide-react"
import Header from "@/components/Header"
import { CameraSystem } from "@/components/camera-system/CameraSystem"
import OfficerViolationManagement from "@/components/officer-violation-management/OfficerViolationManagement"
import { OfficerStatistics } from "@/components/officer-statistics/OfficerStatistics"
import { OverviewStats } from "@/components/officer-dashboard/OverviewStats"
import { OverviewViolations } from "@/components/officer-dashboard/OverviewViolations"
import { OverviewActivity } from "@/components/officer-dashboard/OverviewActivity"

export default function OfficerDashboard() {
  const [mainTab, setMainTab] = useState("overview")
  const [subTab, setSubTab] = useState("pending")

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

        {/* Content Area with Conditional Sidebar */}
        <div className="flex gap-6">
          {/* Left Sidebar - Only show for violations tab */}
          {mainTab === "violations" && (
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
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
            {mainTab === "violations" ? getViolationSubTabContent() : getMainTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}