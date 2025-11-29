"use client"

import { useState, useEffect } from "react"
import { User, Car, FileText, AlertCircle, Search, CreditCard } from "lucide-react"
import Header from "../../src/components/Header"
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

  if (!citizenId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Đang tải thông tin người dùng...</p>
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

        {/* Content Area with Conditional Sidebar */}
        <div className="flex gap-6">
          {/* Left Sidebar - Only show for tabs with sub-tabs */}
          {mainTab === "profile" && (
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
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
            {mainTab === "profile" ? getProfileSubTabContent() : getMainTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
