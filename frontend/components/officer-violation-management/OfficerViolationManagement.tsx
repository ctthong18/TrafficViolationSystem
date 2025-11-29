"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, AlertTriangle, CheckCircle } from "lucide-react"
import ViolationSearch from "./ViolationSearch"
import ViolationList from "./ViolationList"
import { Violation } from "../../hooks/useViolations"
import { officerApi } from "@/lib/api"

interface OfficerViolationManagementProps {
  filter?: string
}

export default function OfficerViolationManagement({ filter = "pending" }: OfficerViolationManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(filter)

  const fetchViolations = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await officerApi.getViolations({ limit: 100 })
      setViolations(data.violations)
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách vi phạm")
      console.error("Error fetching violations:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchViolations()
  }, [])

  useEffect(() => {
    setActiveTab(filter)
  }, [filter])

  const handleProcessViolation = async (id: string, action: string, note: string) => {
    try {
      // Map action to backend format
      let backendAction = action
      if (action === "approve") backendAction = "approve"
      if (action === "reject") backendAction = "reject"
      
      await officerApi.processViolation(id, backendAction as any, note)
      
      // Refresh violations list
      await fetchViolations()
      
      alert("Cập nhật thành công")
    } catch (err: any) {
      alert(err.message || "Không thể cập nhật vi phạm")
      console.error("Error processing violation:", err)
    }
  }

  const filteredViolations = violations.filter(
    (v) =>
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.license_plate.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading && violations.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <p>Đang tải dữ liệu...</p>
        </CardContent>
      </Card>
    )
  }

  if (error && violations.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-destructive">
          <p>Lỗi: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý vi phạm được phân công</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <ViolationSearch value={searchTerm} onChange={setSearchTerm} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-1" />
              Chờ xử lý ({filteredViolations.filter((v) => v.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="reviewing">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Đang xử lý ({filteredViolations.filter((v) => v.status === "reviewing").length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle className="h-4 w-4 mr-1" />
              Đã duyệt ({filteredViolations.filter((v) => v.status === "verified" || v.status === "approved").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <CheckCircle className="h-4 w-4 mr-1" />
              Từ chối ({filteredViolations.filter((v) => v.status === "rejected").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <ViolationList
              violations={filteredViolations}
              status="pending"
              onProcess={handleProcessViolation}
            />
          </TabsContent>

          <TabsContent value="reviewing">
            <ViolationList
              violations={filteredViolations}
              status="reviewing"
              onProcess={handleProcessViolation}
            />
          </TabsContent>

          <TabsContent value="approved">
            <ViolationList
              violations={filteredViolations.filter((v) => v.status === "verified" || v.status === "approved")}
              status="verified"
              onProcess={handleProcessViolation}
            />
          </TabsContent>

          <TabsContent value="rejected">
            <ViolationList
              violations={filteredViolations.filter((v) => v.status === "rejected")}
              status="rejected"
              onProcess={handleProcessViolation}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
