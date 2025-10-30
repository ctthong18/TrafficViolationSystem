"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Search, Eye, UserCheck, Clock, CheckCircle } from "lucide-react"

export default function ViolationManagement() {
  const [searchTerm, setSearchTerm] = useState("")

  const violations = [
    {
      id: "VL001",
      type: "Vượt đèn đỏ",
      location: "Ngã tư Láng Hạ",
      time: "14:30 - 15/01/2024",
      licensePlate: "30A-12345",
      status: "pending",
      assignedTo: null,
      priority: "high",
    },
    {
      id: "VL002",
      type: "Quá tốc độ",
      location: "Đại lộ Thăng Long",
      time: "13:45 - 15/01/2024",
      licensePlate: "29B-67890",
      status: "assigned",
      assignedTo: "Nguyễn Văn A",
      priority: "medium",
    },
    {
      id: "VL003",
      type: "Không đội mũ bảo hiểm",
      location: "Phố Huế",
      time: "12:20 - 15/01/2024",
      licensePlate: "30C-11111",
      status: "completed",
      assignedTo: "Trần Thị B",
      priority: "low",
    },
  ]

  const filteredViolations = violations.filter(
    (violation) =>
      violation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý vi phạm</CardTitle>
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
                Chờ phân công ({filteredViolations.filter((v) => v.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="assigned" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Đã phân công ({filteredViolations.filter((v) => v.status === "assigned").length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Đã hoàn thành ({filteredViolations.filter((v) => v.status === "completed").length})
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
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </Button>
                          <Button size="sm">
                            <UserCheck className="h-4 w-4 mr-1" />
                            Phân công
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="assigned" className="space-y-4">
              {filteredViolations
                .filter((violation) => violation.status === "assigned")
                .map((violation) => (
                  <Card key={violation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{violation.id}</span>
                            <Badge variant="default">Đã phân công</Badge>
                          </div>
                          <p className="text-sm font-medium">{violation.type}</p>
                          <p className="text-sm text-muted-foreground">
                            Biển số: {violation.licensePlate} • {violation.location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {violation.time} • Phụ trách: {violation.assignedTo}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {filteredViolations
                .filter((violation) => violation.status === "completed")
                .map((violation) => (
                  <Card key={violation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{violation.id}</span>
                            <Badge variant="default">Đã hoàn thành</Badge>
                          </div>
                          <p className="text-sm font-medium">{violation.type}</p>
                          <p className="text-sm text-muted-foreground">
                            Biển số: {violation.licensePlate} • {violation.location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {violation.time} • Xử lý bởi: {violation.assignedTo}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
