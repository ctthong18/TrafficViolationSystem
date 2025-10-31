"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, AlertTriangle, FileText, CheckCircle } from "lucide-react"
import { useViolations } from "../../hooks/useViolations"
import { ViolationList } from "./ViolationList"
import { ReportList } from "./ReportList"
import { ProcessedList } from "./ProcessedList"

export default function ViolationManagement() {
  const { violations, reports, loading } = useViolations()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredViolations = violations.filter((v) => {
    const matchSearch =
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === "all" || v.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <Tabs defaultValue="violations">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="violations">
            <AlertTriangle className="h-4 w-4 mr-2" /> Camera
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" /> Báo cáo dân
          </TabsTrigger>
          <TabsTrigger value="processed">
            <CheckCircle className="h-4 w-4 mr-2" /> Đã xử lý
          </TabsTrigger>
        </TabsList>

        {/* Bộ lọc */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm ID, biển số, địa điểm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="processed">Đã xử lý</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nội dung các tab */}
        <TabsContent value="violations">
          {loading ? (
            <p className="text-center text-muted-foreground mt-6">Đang tải dữ liệu...</p>
          ) : (
            <ViolationList data={filteredViolations} />
          )}
        </TabsContent>

        <TabsContent value="reports">
          {loading ? (
            <p className="text-center text-muted-foreground mt-6">Đang tải dữ liệu...</p>
          ) : (
            <ReportList data={reports} />
          )}
        </TabsContent>

        <TabsContent value="processed">
          <ProcessedList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
