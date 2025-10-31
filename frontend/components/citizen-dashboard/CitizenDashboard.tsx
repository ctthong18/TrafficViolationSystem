"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileText, User, CreditCard } from "lucide-react"
import Header from "../../src/components/Header"
import { ViolationLookup } from "@/components/violation-lookup/violation-lookup"
import { ViolationReport } from "@/components/violation-report/ViolationReport"
import { CitizenProfile } from "@/components/citizen-profile/CitizenProfile"
import { PaymentGuide } from "@/components/payment-guide/PaymentGuide"
import { useViolations } from "@/hooks/useViolations"
import { ViolationStats } from "@/components/citizen-dashboard/ViolationStats"
import { ViolationList } from "@/components/citizen-dashboard/ViolationList"
import { useCitizen } from "@/hooks/useCitizen" 

export function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState("lookup")
  const { violations, loading, error } = useViolations()
  const [citizenId, setCitizenId] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setCitizenId(parsedUser.id)
    }
  }, [])
  const { citizen, loading: citizenLoading, error: citizenError } = useCitizen(citizenId || "")

  const handleLogout = () => {
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  if (!citizenId) {
    return <p className="text-center mt-10">Đang tải thông tin người dùng...</p>
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
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

          <TabsContent value="lookup" className="space-y-6">
            {loading && <p>Đang tải dữ liệu...</p>}
            {error && <p className="text-destructive">{error}</p>}
            {!loading && !error && violations.length > 0 && (
              <>
                <ViolationStats violations={violations} />
                <ViolationList violations={violations} />
                <ViolationLookup />
              </>
            )}
          </TabsContent>

          <TabsContent value="report">
            <ViolationReport />
          </TabsContent>

          <TabsContent value="profile">
            {citizenLoading && <p>Đang tải thông tin cá nhân...</p>}
            {citizenError && <p className="text-destructive">{citizenError}</p>}
            {citizen && <CitizenProfile citizenId={citizenId} />}
          </TabsContent>

          <TabsContent value="payment">
            <PaymentGuide />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
