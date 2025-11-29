"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera, MapPin, Wifi, WifiOff, Settings, Pencil, Trash, Wrench, FileCog, Info } from "lucide-react"
import type { Camera as CameraType } from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

interface CameraCardProps {
  camera: any
  rawCameras: CameraType[]
  onViewLive: (camera: CameraType) => void

  // NEW: actions for settings menu
  onEditCamera?: (camera: CameraType) => void
  onDeleteCamera?: (camera: CameraType) => void
  onUpdateStatus?: (camera: CameraType, status: string) => void
  onEditAIConfig?: (camera: CameraType) => void
  onViewDetails?: (camera: CameraType) => void
  onMaintenance?: (camera: CameraType) => void
}

export function CameraCard({
  camera,
  rawCameras,
  onViewLive,
  onEditCamera,
  onDeleteCamera,
  onUpdateStatus,
  onEditAIConfig,
  onViewDetails,
  onMaintenance
}: CameraCardProps) {

  const fullCamera = rawCameras.find(c => c.camera_id === camera.camera_id || c.id === camera.id)

  const getStatusColor = (s: string) => ({
    online: "bg-success",
    offline: "bg-destructive",
    maintenance: "bg-warning"
  }[s] || "bg-muted")

  const getStatusText = (s: string) => ({
    online: "Hoạt động",
    offline: "Ngoại tuyến",
    maintenance: "Bảo trì"
  }[s] || "Không xác định")

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5" />
            <div className="flex flex-col">
              <span>{camera.id}</span>
              <span className="text-xs text-muted-foreground">{camera.name}</span>
            </div>
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

        {/* LOCATION */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <span className="text-sm">{camera.location}</span>
        </div>

        {/* VIOLATION */}
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

        {/* BUTTONS */}
        <div className="flex gap-2">

          {/* VIEW LIVE */}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
            onClick={() => fullCamera && onViewLive(fullCamera)}
          >
            {camera.status === "online" ? (
              <Wifi className="h-4 w-4 mr-2" />
            ) : (
              <WifiOff className="h-4 w-4 mr-2" />
            )}
            Xem live
          </Button>

          {/* SETTINGS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Cài đặt camera</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => fullCamera && onEditCamera?.(fullCamera)}>
                <Pencil className="h-4 w-4 mr-2" />
                Chỉnh sửa thông tin
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => fullCamera && onUpdateStatus?.(fullCamera, "online")}>
                Đặt trạng thái: Hoạt động
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fullCamera && onUpdateStatus?.(fullCamera, "offline")}>
                Đặt trạng thái: Ngoại tuyến
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fullCamera && onUpdateStatus?.(fullCamera, "maintenance")}>
                Đặt trạng thái: Bảo trì
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => fullCamera && onEditAIConfig?.(fullCamera)}>
                <FileCog className="h-4 w-4 mr-2" />
                Cấu hình AI
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => fullCamera && onMaintenance?.(fullCamera)}>
                <Wrench className="h-4 w-4 mr-2" />
                Cập nhật bảo trì
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => fullCamera && onViewDetails?.(fullCamera)}>
                <Info className="h-4 w-4 mr-2" />
                Xem chi tiết
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-600"
                onClick={() => fullCamera && onDeleteCamera?.(fullCamera)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Xóa camera
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </CardContent>
    </Card>
  )
}
