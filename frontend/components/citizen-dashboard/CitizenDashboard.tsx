"use client"

import { useState, useEffect } from "react"
import { 
  User, Car, FileText, AlertCircle, Search, Bell, 
  CreditCard, Shield, MessageSquare, Settings, LogOut 
} from "lucide-react"
import { useViolations } from "@/hooks/useViolations"
import { useCitizen } from "@/hooks/useCitizen"
import { ViolationStats } from "./ViolationStats"
import { ViolationList } from "./ViolationList"
import { ViolationLookup } from "@/components/violation-lookup/violation-lookup"
import { ViolationReport } from "@/components/violation-report/ViolationReport"
import { CitizenProfile } from "@/components/citizen-profile/CitizenProfile"
import { PaymentSection } from "@/components/payment-section/PaymentSection" 

export function CitizenDashboard() {
  const [mainTab, setMainTab] = useState("search")
  const [subTab, setSubTab] = useState("account")
  const [citizenId, setCitizenId] = useState<string | null>(null)
  
  const { violations, loading: violationsLoading, error: violationsError } = useViolations()
  const { citizen, loading: citizenLoading, error: citizenError } = useCitizen(citizenId || "")

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setCitizenId(parsedUser.id)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
    window.location.href = "/login"
  }

  if (!citizenId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <p className="text-slate-400">Đang tải thông tin người dùng...</p>
      </div>
    )
  }

  const mainTabs = [
    { id: "search", label: "Tra cứu vi phạm", icon: Search },
    { id: "report", label: "Báo cáo & Tố cáo", icon: FileText },
    { id: "profile", label: "Thông tin cá nhân", icon: User },
    { id: "transaction", label: "Giao dịch", icon: CreditCard },
  ]

  const profileSubTabs = [
    { id: "account", label: "Chi tiết tài khoản", icon: User },
    { id: "vehicle", label: `Phương tiện (${citizen?.vehicles?.length || 0})`, icon: Car },
    { id: "license", label: "Bằng lái xe", icon: FileText },
    { id: "history", label: "Lịch sử vi phạm", icon: AlertCircle },
  ]

  const getMainTabContent = () => {
    switch (mainTab) {
      case "search":
        return (
          <div className="space-y-6">
            {violationsLoading && <p className="text-slate-400">Đang tải dữ liệu...</p>}
            {violationsError && <p className="text-red-400">{violationsError}</p>}
            {!violationsLoading && !violationsError && violations.length > 0 && (
              <>
                <ViolationStats violations={violations} />
                <ViolationList violations={violations} />
              </>
            )}
            <ViolationLookup />
          </div>
        )
      
      case "report":
        return <ViolationReport />
      
      case "profile":
        return null // Handled by sidebar
      
      case "transaction":
        return <PaymentSection />
      
      default:
        return null
    }
  }

  const getProfileSubTabContent = () => {
    if (mainTab !== "profile") return null

    return <CitizenProfile citizenId={citizenId} activeSubTab={subTab} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Tabs - Horizontal */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="text-xl font-bold text-primary">GTVT System</div>
              <div className="flex items-center gap-1">
                {mainTabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setMainTab(tab.id)
                        if (tab.id === "profile") setSubTab("account")
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
        {/* Left Sidebar - Only show for tabs with sub-tabs */}
        {mainTab === "profile" && (
          <div className="w-64 border-r min-h-[calc(100vh-4rem)] bg-muted/30">
            <div className="p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Thông Tin Cá Nhân
              </h3>
              <nav className="space-y-1">
                {profileSubTabs.map((tab) => {
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
                {mainTab === "search" && "Tra cứu vi phạm"}
                {mainTab === "report" && "Báo cáo & Tố cáo"}
                {mainTab === "profile" && "Thông tin cá nhân"}
                {mainTab === "transaction" && "Giao dịch"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mainTab === "search" && "Tra cứu và xem chi tiết các vi phạm giao thông"}
                {mainTab === "report" && "Báo cáo vi phạm và tố cáo hành vi vi phạm"}
                {mainTab === "profile" && subTab === "account" && "Quản lý thông tin và tài liệu của bạn"}
                {mainTab === "profile" && subTab === "vehicle" && "Danh sách các phương tiện của bạn"}
                {mainTab === "profile" && subTab === "license" && "Thông tin về bằng lái xe"}
                {mainTab === "profile" && subTab === "history" && "Xem lịch sử các vi phạm giao thông"}
                {mainTab === "transaction" && "Quản lý thanh toán và ví điện tử"}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {mainTab === "profile" ? getProfileSubTabContent() : getMainTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
