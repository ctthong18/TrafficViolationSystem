"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, MapPin, Wifi, WifiOff, Settings, Search } from "lucide-react"

export function CameraSystem() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const cameras = [
    {
      id: "CAM-001",
      location: "Ngã tư Láng Hạ - Thái Hà",
      status: "online",
      violations: 12,
      lastUpdate: "2 phút trước",
    },
    { id: "CAM-002", location: "Cầu Nhật Tân", status: "online", violations: 8, lastUpdate: "1 phút trước" },
    { id: "CAM-003", location: "Đại lộ Thăng Long", status: "offline", violations: 0, lastUpdate: "15 phút trước" },
    { id: "CAM-004", location: "Phố Huế - Bà Triệu", status: "online", violations: 15, lastUpdate: "30 giây trước" },
    { id: "CAM-005", location: "Ngã tư Sở", status: "maintenance", violations: 0, lastUpdate: "1 giờ trước" },
    { id: "CAM-006", location: "Cầu Long Biên", status: "online", violations: 6, lastUpdate: "3 phút trước" },
  ]

  const filteredCameras = cameras.filter((camera) => {
    const matchesSearch =
      camera.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camera.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || camera.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-success"
      case "offline":
        return "bg-destructive"
      case "maintenance":
        return "bg-warning"
      default:
        return "bg-muted"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Hoạt động"
      case "offline":
        return "Ngoại tuyến"
      case "maintenance":
        return "Bảo trì"
      default:
        return "Không xác định"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm camera theo vị trí hoặc ID..."
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
            <SelectItem value="online">Hoạt động</SelectItem>
            <SelectItem value="offline">Ngoại tuyến</SelectItem>
            <SelectItem value="maintenance">Bảo trì</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCameras.map((camera) => (
          <Card key={camera.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  {camera.id}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(camera.status)}`} />
                  <Badge variant={camera.status === "online" ? "default" : "secondary"}>
                    {getStatusText(camera.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">{camera.location}</span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Vi phạm hôm nay</p>
                  <p className="text-2xl font-bold text-warning">{camera.violations}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Cập nhật cuối</p>
                  <p className="text-sm">{camera.lastUpdate}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  {camera.status === "online" ? (
                    <Wifi className="h-4 w-4 mr-2" />
                  ) : (
                    <WifiOff className="h-4 w-4 mr-2" />
                  )}
                  Xem live
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCameras.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Không tìm thấy camera nào phù hợp với bộ lọc</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
