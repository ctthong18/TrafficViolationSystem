"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useCameras } from "@/hooks/useCameras"
import type { Camera as CameraType } from "@/lib/api"
import { CameraCard } from "./CameraCard"
import { CameraLiveGrid } from "./CameraLiveGrid"
import { CameraLiveDialog } from "./CameraLiveDialog"
import { Card, CardContent } from "../ui/card"
import { Camera } from "lucide-react"
import DetectVideo from "./DetectVideo"

type ViewMode = "card" | "liveRealtime" | "liveDetected"

export function CameraSystem() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<ViewMode>("card")
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null)
  const [liveDialogOpen, setLiveDialogOpen] = useState(false)

  const viewOptions = [
    { value: "card", label: "Quản lý Thiết bị" },
    { value: "liveRealtime", label: "Giám sát Thời gian thực" },
    { value: "liveDetected", label: "Cảnh báo & Sự kiện" }
  ]

  const { cameras: rawCameras, loading, error } = useCameras({
    limit: 100,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchTerm || undefined
  })

  const cameras = rawCameras.map((item) => {
    const statusRaw = (item?.status || "online").toLowerCase()
    const status =
      statusRaw === "offline" || statusRaw === "maintenance"
        ? statusRaw
        : "online"
    const lastViolationAt = item?.last_violation_at
      ? new Date(item.last_violation_at).toLocaleString("vi-VN")
      : "Chưa có dữ liệu"

    return {
      id: item?.id ?? 0,  // Keep numeric database ID
      camera_id: item?.camera_id ?? `CAM-${item?.id ?? "UNKNOWN"}`,
      name: item?.name ?? item?.camera_id ?? "Camera",
      location: item?.location_name ?? item?.address ?? item?.name ?? item?.camera_id ?? "Không rõ vị trí",
      status: status as "online" | "offline" | "maintenance",
      violations: Number(item?.violations_today ?? 0),
      lastUpdate: lastViolationAt,
      // Thêm các field từ model mới
      location_name: item?.location_name,
      address: item?.address,
      violations_today: item?.violations_today,
      last_violation_at: item?.last_violation_at,
      numeric_id: item?.id  // Explicit numeric ID for video fetching
    }
  })

  const filteredCameras = cameras.filter((camera) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      camera.location.toLowerCase().includes(searchLower) ||
      camera.camera_id.toLowerCase().includes(searchLower) ||
      camera.name.toLowerCase().includes(searchLower) ||
      camera.id.toString().includes(searchLower)
    const matchesStatus = statusFilter === "all" || camera.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value === 0) setViewMode("card")
    else if (value === 1) setViewMode("liveRealtime")
    else setViewMode("liveDetected")
  }

  const getSliderValue = () => {
    return ["card", "liveRealtime", "liveDetected"].indexOf(viewMode)
  }

  const getCurrentViewModeLabel = () => {
    const option = viewOptions.find(opt => opt.value === viewMode)
    return option ? option.label : viewMode
  }

  if (loading) return <p>Đang tải dữ liệu camera...</p>
  if (error) return <p className="text-destructive">{error}</p>

  return (
    <div className="space-y-6">
      {/* Header: Search + Filter + ViewMode Slider */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex-1 flex gap-4">
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
        
        {/* View Mode Slider */}
        <div className="flex flex-col items-center w-full sm:w-64">
          {/* Slider */}
          <input
            type="range"
            min={0}
            max={2}
            step={1}
            value={getSliderValue()}
            onChange={handleViewModeChange}
            className="w-full accent-blue-500"
          />

          {/* Labels */}
          <div className="flex justify-between w-full text-sm mt-1">
            <span className="text-xs">Quản lý</span>
            <span className="text-xs">Giám sát</span>
            <span className="text-xs">Cảnh báo</span>
          </div>

          {/* Current Mode Display */}
          <p className="text-xs text-muted-foreground mt-1">
            Chế độ: {getCurrentViewModeLabel()}
          </p>
        </div>
      </div>

      {/* Camera Content based on View Mode */}
      {viewMode === "card" ? (
        filteredCameras.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCameras.map((camera) => (
              <CameraCard
                key={camera.id}
                camera={camera}
                rawCameras={rawCameras}
                onViewLive={(fullCamera) => {
                  setSelectedCamera(fullCamera)
                  setLiveDialogOpen(true)
                }}
              />
            ))}
          </div>
        ) : (
          <NoCameraFound />
        )
      ) : viewMode === "liveRealtime" ? (
        <CameraLiveGrid cameras={filteredCameras} />
      ) : (
        // Chế độ liveDetected
        <div className="space-y-4">
          {filteredCameras.length > 0 ? (
              <DetectVideo />
          ) : (
            <NoCameraFound />
          )}
        </div>
      )}

      <CameraLiveDialog
        camera={selectedCamera}
        open={liveDialogOpen}
        onOpenChange={setLiveDialogOpen}
      />
    </div>
  )
}

// Component hiển thị khi không tìm thấy camera
export function NoCameraFound() {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Không tìm thấy camera nào phù hợp với bộ lọc</p>
      </CardContent>
    </Card>
  )
}