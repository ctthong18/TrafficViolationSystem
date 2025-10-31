"use client"

import Header from "../components/Header"
import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Search, FileText, User, CreditCard } from "lucide-react"
import { ViolationLookup } from "../../components/violation-lookup/violation-lookup"
import { ViolationReport } from "../../components/violation-report/ViolationReport"
import { CitizenProfile } from "../../components/citizen-profile/CitizenProfile"
import { PaymentGuide } from "../../components/payment-guide/PaymentGuide"

type Stat = {
  title: string
  value: string
  icon: any
  color: string
}

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState("lookup")
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [citizenId, setCitizenId] = useState<string | null>(null)

  // const router = useRouter()

  // removed unused handleLogout

  const fetchDashboardStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/v1/citizen/dashboard")
      if (!res.ok) throw new Error("Không thể tải dữ liệu dashboard")
      const data: Stat[] = await res.json()
      setStats(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user?.id) setCitizenId(String(user.id))
      }
    } catch {}
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {loading && <p>Đang tải dữ liệu...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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

          <TabsContent value="lookup">
            <ViolationLookup />
          </TabsContent>

          <TabsContent value="report">
            <ViolationReport />
          </TabsContent>

          <TabsContent value="profile">
            {citizenId ? <CitizenProfile citizenId={citizenId} /> : <p>Đang tải...</p>}
          </TabsContent>

          <TabsContent value="payment">
            <PaymentGuide />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
