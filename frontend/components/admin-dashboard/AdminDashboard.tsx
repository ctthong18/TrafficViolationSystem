"use client"

import { useState } from "react"
import { 
  BarChart3, AlertTriangle, Users, Camera, TrendingUp,
  UserCheck, BarChart2, MessageSquare, FileText
} from "lucide-react"
import Header from "@/components/Header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import ViolationManagement from "@/components/violation-management/ViolationManagement"
import { StatisticsPanel } from "@/components/statistics/StatisticsPanel"
import { OfficerList } from "@/components/officer-management/OfficerList"
import { OfficerPerformance } from "@/components/officer-management/OfficerPerformance"
import { DenunciationList } from "@/components/denunciation/DenunciationList"
import { ComplaintsList } from "@/components/complaints/ComplaintsList"
import { CameraSystem } from "@/components/camera-system/CameraSystem"
import { useOfficers } from "@/hooks/useOfficers"

export default function AdminDashboard() {
  const [mainTab, setMainTab] = useState("overview")
  const [violationSubTab, setViolationSubTab] = useState("all")
  const [officerSubTab, setOfficerSubTab] = useState("list")
  const { officers, loading: officersLoading } = useOfficers()

  // Violation sub-tabs
  const violationSubTabs = [
    { id: "all", label: "Tất cả vi phạm", icon: AlertTriangle },
    { id: "complaints", label: "Khiếu nại", icon: MessageSquare },
    { id: "denunciations", label: "Tố cáo", icon: FileText },
  ]

  // Officer sub-tabs
  const officerSubTabs = [
    { id: "list", label: "Danh sách cán bộ", icon: UserCheck },
    { id: "performance", label: "Thống kê cán bộ", icon: BarChart2 },
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

    return <ViolationManagement />
  }

  const getOfficerContent = () => {
    if (officersLoading) {
      return (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="col-span-1">
            <Card>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    switch (officerSubTab) {
      case "list":
        return (
          <div className="flex gap-6">
            {/* Danh sách cán bộ - 2/3 */}
            <div className="flex-[2]">
              <OfficerList officers={officers} />
            </div>
            {/* Thống kê hoạt động - 1/3 */}
            <div className="flex-[1]">
              <OfficerPerformance compact={true} />
            </div>
          </div>
        )
      case "performance":
        return <OfficerPerformance compact={false} />
      default:
        return (
          <div className="flex gap-6">
            {/* Danh sách cán bộ - 2/3 */}
            <div className="flex-[2]">
              <OfficerList officers={officers} />
            </div>
            {/* Thống kê hoạt động - 1/3 */}
            <div className="flex-[1]">
              <OfficerPerformance compact={true} />
            </div>
          </div>
        )
    }
  }



  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* TAB NGANG CHÍNH */}
        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="violations" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Quản lý vi phạm
            </TabsTrigger>
            <TabsTrigger value="officers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Quản lý cán bộ
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
          <TabsContent value="overview">
            <StatisticsPanel />
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

          {/* QUẢN LÝ CÁN BỘ - CÓ SIDEBAR DỌC */}
          <TabsContent value="officers">
            <div className="flex gap-6">
              {/* SIDEBAR DỌC */}
              <div className="w-64 flex-shrink-0">
                <div className="sticky top-6 space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                    Quản Lý Cán Bộ
                  </h3>
                  {officerSubTabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setOfficerSubTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm ${
                          officerSubTab === tab.id
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
                {getOfficerContent()}
              </div>
            </div>
          </TabsContent>

          {/* CAMERA & AI - SỬ DỤNG CAMERASYSTEM VỚI THANH TRƯỢT */}
          <TabsContent value="camera">
            <CameraSystem />
          </TabsContent>

          {/* THỐNG KÊ */}
          <TabsContent value="statistics">
            <StatisticsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
