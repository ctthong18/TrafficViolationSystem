"use client"

import { useState } from "react"
import { 
  BarChart3, AlertTriangle, Camera, TrendingUp,
  Clock, ClipboardList, CheckCircle, XCircle,
  MessageSquare, FileText, AlertCircle
} from "lucide-react"
import Header from "@/components/Header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OfficerViolationManagement from "@/components/officer-violation-management/OfficerViolationManagement"
import { OfficerStatistics } from "@/components/officer-statistics/OfficerStatistics"
import { OverviewStats } from "@/components/officer-dashboard/OverviewStats"
import { OverviewViolations } from "@/components/officer-dashboard/OverviewViolations"
import { OverviewActivity } from "@/components/officer-dashboard/OverviewActivity"
import { DenunciationList } from "@/components/denunciation/DenunciationList"
import { ComplaintsList } from "@/components/complaints/ComplaintsList"
import { CameraSystem } from "@/components/camera-system/CameraSystem"

export default function OfficerDashboard() {
  const [mainTab, setMainTab] = useState("overview")
  const [violationSubTab, setViolationSubTab] = useState("pending")

  // Violation sub-tabs
  const violationSubTabs = [
    { id: "pending", label: "Chờ xử lý", icon: Clock },
    { id: "reviewing", label: "Đang xem xét", icon: ClipboardList },
    { id: "approved", label: "Đã duyệt", icon: CheckCircle },
    { id: "rejected", label: "Từ chối", icon: XCircle },
    { id: "complaints", label: "Khiếu nại", icon: MessageSquare },
    { id: "denunciations", label: "Tố cáo", icon: FileText },
  ]

  const getViolationContent = () => {
    if (violationSubTab === "complaints") {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quản lý khiếu nại</h3>
          <ComplaintsList />
        </div>
      )
    }

    if (violationSubTab === "denunciations") {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quản lý tố cáo</h3>
          <DenunciationList />
        </div>
      )
    }

    return <OfficerViolationManagement filter={violationSubTab} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* TAB NGANG CHÍNH */}
        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="violations" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Quản lý vi phạm
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Camera & AI
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Thống kê
            </TabsTrigger>
          </TabsList>

          {/* TỔNG QUAN */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewStats />
            <div className="grid gap-6 md:grid-cols-2">
              <OverviewViolations />
              <OverviewActivity />
            </div>
          </TabsContent>

          {/* QUẢN LÝ VI PHẠM - CÓ SIDEBAR DỌC */}
          <TabsContent value="violations">
            <div className="flex gap-6">
              {/* SIDEBAR DỌC */}
              <div className="w-64 flex-shrink-0">
                <div className="sticky top-6 space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                    Quản Lý Vi Phạm
                  </h3>
                  {violationSubTabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setViolationSubTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm ${
                          violationSubTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* NỘI DUNG */}
              <div className="flex-1">
                {getViolationContent()}
              </div>
            </div>
          </TabsContent>

          {/* CAMERA & AI - SỬ DỤNG CAMERASYSTEM VỚI THANH TRƯỢT */}
          <TabsContent value="camera">
            <CameraSystem />
          </TabsContent>

          {/* THỐNG KÊ */}
          <TabsContent value="statistics">
            <OfficerStatistics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
