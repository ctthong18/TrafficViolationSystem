"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Search, Eye, FileText, User } from "lucide-react"

export function ViolationManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const violations = [
    {
      id: "VL-001",
      type: "Vượt đèn đỏ",
      location: "Ngã tư Láng Hạ",
      time: "14:30 - 15/12/2024",
      licensePlate: "30A-12345",
      status: "pending",
      officer: null,
      fine: "1,000,000 VNĐ",
      evidence: "CAM-001_20241215_1430.jpg",
    },
    {
      id: "VL-002",
      type: "Quá tốc độ",
      location: "Đại lộ Thăng Long",
      time: "14:25 - 15/12/2024",
      licensePlate: "29B-67890",
      status: "processed",
      officer: "Nguyễn Văn A",
      fine: "800,000 VNĐ",
      evidence: "CAM-002_20241215_1425.jpg",
    },
    {
      id: "VL-003",
      type: "Không đội mũ bảo hiểm",
      location: "Phố Huế",
      time: "14:20 - 15/12/2024",
      licensePlate: "30F-11111",
      status: "pending",
      officer: null,
      fine: "200,000 VNĐ",
      evidence: "CAM-004_20241215_1420.jpg",
    },
    {
      id: "VL-004",
      type: "Đỗ xe sai quy định",
      location: "Phố Bà Triệu",
      time: "13:45 - 15/12/2024",
      licensePlate: "30G-22222",
      status: "processed",
      officer: "Trần Thị B",
      fine: "300,000 VNĐ",
      evidence: "Báo cáo từ người dân",
    },
  ]

  const reports = [
    {
      id: "RP-001",
      type: "Đỗ xe sai quy định",
      location: "Phố Hoàn Kiếm",
      time: "10:30 - 15/12/2024",
      reporter: "Nguyễn Văn C",
      status: "reviewing",
      description: "Xe ô tô đỗ trên vỉa hè, cản trở giao thông người đi bộ",
    },
    {
      id: "RP-002",
      type: "Lấn làn",
      location: "Cầu Chương Dương",
      time: "09:15 - 15/12/2024",
      reporter: "Lê Thị D",
      status: "verified",
      description: "Xe máy chạy vào làn ô tô",
    },
  ]

  const filteredViolations = violations.filter((violation) => {
    const matchesSearch =
      violation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || violation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return <Badge className="bg-success text-success-foreground">Đã xử lý</Badge>
      case "pending":
        return <Badge variant="secondary">Chờ xử lý</Badge>
      case "reviewing":
        return <Badge className="bg-warning text-warning-foreground">Đang xem xét</Badge>
      case "verified":
        return <Badge className="bg-success text-success-foreground">Đã xác minh</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="violations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="violations" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Vi phạm từ camera
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Báo cáo từ người dân
          </TabsTrigger>
          <TabsTrigger value="processed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Đã xử lý
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo ID, biển số, địa điểm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="processed">Đã xử lý</SelectItem>
              <SelectItem value="reviewing">Đang xem xét</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="violations" className="space-y-4">
          {filteredViolations.map((violation) => (
            <Card key={violation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    {violation.id}
                  </CardTitle>
                  {getStatusBadge(violation.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Loại vi phạm:</span>
                      <p className="font-medium">{violation.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Địa điểm:</span>
                      <p className="font-medium">{violation.location}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Thời gian:</span>
                      <p className="font-medium">{violation.time}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Biển số:</span>
                      <p className="font-medium">{violation.licensePlate}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Mức phạt:</span>
                      <p className="font-medium text-warning">{violation.fine}</p>
                    </div>
                    {violation.officer && (
                      <div>
                        <span className="text-sm text-muted-foreground">Cán bộ xử lý:</span>
                        <p className="font-medium">{violation.officer}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Xem bằng chứng
                  </Button>
                  {violation.status === "pending" && (
                    <Button size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Phân công xử lý
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {report.id}
                  </CardTitle>
                  {getStatusBadge(report.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Loại vi phạm:</span>
                      <p className="font-medium">{report.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Địa điểm:</span>
                      <p className="font-medium">{report.location}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Thời gian:</span>
                      <p className="font-medium">{report.time}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Người báo cáo:</span>
                      <p className="font-medium">{report.reporter}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Mô tả:</span>
                      <p className="text-sm">{report.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Xem chi tiết
                  </Button>
                  {report.status === "reviewing" && (
                    <>
                      <Button size="sm" className="bg-success text-success-foreground">
                        Xác minh
                      </Button>
                      <Button variant="outline" size="sm">
                        Từ chối
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="processed">
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <p className="text-muted-foreground">Danh sách các vi phạm đã được xử lý sẽ hiển thị ở đây</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
