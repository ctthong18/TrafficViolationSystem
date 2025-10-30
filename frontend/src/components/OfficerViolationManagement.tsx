"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Search, Eye, Edit, CheckCircle, Clock, AlertTriangle } from "lucide-react"

export default function OfficerViolationManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedViolation, setSelectedViolation] = useState<any>(null)

  const violations = [
    {
      id: "VL001",
      type: "Vượt đèn đỏ",
      location: "Ngã tư Láng Hạ",
      time: "14:30 - 15/01/2024",
      licensePlate: "30A-12345",
      status: "pending",
      priority: "high",
      evidence: "/placeholder.jpg",
      description: "Xe máy vượt đèn đỏ tại ngã tư Láng Hạ",
    },
    {
      id: "VL005",
      type: "Quá tốc độ",
      location: "Đại lộ Thăng Long",
      time: "13:45 - 15/01/2024",
      licensePlate: "29B-67890",
      status: "processing",
      priority: "medium",
      evidence: "/placeholder.jpg",
      description: "Ô tô vượt quá tốc độ cho phép 20km/h",
    },
    {
      id: "VL008",
      type: "Không đội mũ bảo hiểm",
      location: "Phố Huế",
      time: "12:20 - 15/01/2024",
      licensePlate: "30C-11111",
      status: "pending",
      priority: "low",
      evidence: "/placeholder.jpg",
      description: "Người điều khiển xe máy không đội mũ bảo hiểm",
    },
  ]

  const filteredViolations = violations.filter(
    (violation) =>
      violation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleProcessViolation = (violationId: string, action: string, note: string) => {
    console.log(`Processing violation ${violationId} with action: ${action}, note: ${note}`)
    // Here you would typically make an API call to update the violation
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý vi phạm được phân công</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã vi phạm, loại vi phạm hoặc biển số..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Chờ xử lý ({filteredViolations.filter((v) => v.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="processing" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Đang xử lý ({filteredViolations.filter((v) => v.status === "processing").length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Đã hoàn thành (0)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {filteredViolations
                .filter((violation) => violation.status === "pending")
                .map((violation) => (
                  <Card key={violation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{violation.id}</span>
                            <Badge
                              variant={
                                violation.priority === "high"
                                  ? "destructive"
                                  : violation.priority === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {violation.priority === "high"
                                ? "Ưu tiên cao"
                                : violation.priority === "medium"
                                  ? "Ưu tiên trung bình"
                                  : "Ưu tiên thấp"}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{violation.type}</p>
                          <p className="text-sm text-muted-foreground">
                            Biển số: {violation.licensePlate} • {violation.location}
                          </p>
                          <p className="text-xs text-muted-foreground">{violation.time}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedViolation(violation)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Xem chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Chi tiết vi phạm {violation.id}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Loại vi phạm</Label>
                                    <p className="text-sm">{violation.type}</p>
                                  </div>
                                  <div>
                                    <Label>Biển số xe</Label>
                                    <p className="text-sm">{violation.licensePlate}</p>
                                  </div>
                                  <div>
                                    <Label>Địa điểm</Label>
                                    <p className="text-sm">{violation.location}</p>
                                  </div>
                                  <div>
                                    <Label>Thời gian</Label>
                                    <p className="text-sm">{violation.time}</p>
                                  </div>
                                </div>
                                <div>
                                  <Label>Mô tả</Label>
                                  <p className="text-sm">{violation.description}</p>
                                </div>
                                <div>
                                  <Label>Bằng chứng</Label>
                                  <img
                                    src={violation.evidence || "/placeholder.svg"}
                                    alt="Evidence"
                                    className="w-full h-48 object-cover rounded-lg border"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="processing-note">Ghi chú xử lý</Label>
                                  <Textarea
                                    id="processing-note"
                                    placeholder="Nhập ghi chú về quá trình xử lý..."
                                    className="min-h-[100px]"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleProcessViolation(violation.id, "approve", "Xác nhận vi phạm")}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Xác nhận vi phạm
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleProcessViolation(violation.id, "reject", "Từ chối vi phạm")}
                                    className="flex-1"
                                  >
                                    Từ chối
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="processing" className="space-y-4">
              {filteredViolations
                .filter((violation) => violation.status === "processing")
                .map((violation) => (
                  <Card key={violation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{violation.id}</span>
                            <Badge variant="default">Đang xử lý</Badge>
                          </div>
                          <p className="text-sm font-medium">{violation.type}</p>
                          <p className="text-sm text-muted-foreground">
                            Biển số: {violation.licensePlate} • {violation.location}
                          </p>
                          <p className="text-xs text-muted-foreground">{violation.time}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Cập nhật
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có vi phạm nào được hoàn thành hôm nay</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
