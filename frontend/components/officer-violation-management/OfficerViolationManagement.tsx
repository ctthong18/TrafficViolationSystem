"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, AlertTriangle, CheckCircle } from "lucide-react"
import ViolationSearch from "./ViolationSearch"
import ViolationList from "./ViolationList"
import { Violation } from "../../hooks/useViolations"

export default function OfficerViolationManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchViolations = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('access_token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/officer/violations/review-queue`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) throw new Error("Không thể tải danh sách vi phạm")
        const data: Violation[] = await res.json()
        setViolations(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchViolations()
  }, [])

  const handleProcessViolation = async (id: string, action: string, note: string) => {
    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/officer/violations/${id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, notes: note }),
      })
      if (!res.ok) throw new Error("Không thể cập nhật vi phạm")
      setViolations((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, status: action === "approve" ? "verified" : "processed" } : v,
        ),
      )
      alert("Cập nhật thành công")
    } catch (err: any) {
      alert(err.message)
    }
  }

  const filteredViolations = violations.filter(
    (v) =>
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) return <p>Đang tải dữ liệu...</p>
  if (error) return <p className="text-destructive">Lỗi: {error}</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý vi phạm được phân công</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <ViolationSearch value={searchTerm} onChange={setSearchTerm} />
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-1" />
              Chờ xử lý ({filteredViolations.filter((v) => v.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="reviewing">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Đang xử lý ({filteredViolations.filter((v) => v.status === "reviewing").length})
            </TabsTrigger>
            <TabsTrigger value="verified">
              <CheckCircle className="h-4 w-4 mr-1" />
              Đã xác nhận ({filteredViolations.filter((v) => v.status === "verified").length})
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

          <TabsContent value="verified">
            <ViolationList
              violations={filteredViolations}
              status="verified"
              onProcess={handleProcessViolation}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
