"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { detectionApi, cameraApi, AIDetection, Camera } from "@/lib/api"
import { DetectionReviewInterface } from "./DetectionReviewInterface"
import { VideoPlayer } from "../process-video/VideoPlayer"
import { 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Filter,
  RefreshCw,
  Search,
  Calendar,
  TrendingUp,
  Clock,
  Video,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface DetectionDashboardProps {
  className?: string
}

export function DetectionDashboard({ className = "" }: DetectionDashboardProps) {
  const [detections, setDetections] = useState<AIDetection[]>([])
  const [cameras, setCameras] = useState<Camera[]>([])
  const [selectedDetection, setSelectedDetection] = useState<AIDetection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  
  // Filters
  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null)
  const [violationType, setViolationType] = useState("")
  const [minConfidence, setMinConfidence] = useState<number | null>(null)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Load cameras
  useEffect(() => {
    const loadCameras = async () => {
      try {
        const response = await cameraApi.getAll({ limit: 100 })
        setCameras(response.items)
      } catch (err) {
        console.error("Failed to load cameras:", err)
      }
    }
    loadCameras()
  }, [])

  // Load detections
  const loadDetections = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await detectionApi.getPending({
        camera_id: selectedCameraId || undefined,
        violation_type: violationType || undefined,
        min_confidence: minConfidence || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        skip: (page - 1) * limit,
        limit
      })
      
      setDetections(response.detections)
      setTotal(response.total)
    } catch (err: any) {
      console.error("Failed to load detections:", err)
      setError(err.message || "Không thể tải danh sách phát hiện")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDetections()
  }, [page, selectedCameraId, violationType, minConfidence, dateFrom, dateTo])

  const handleResetFilters = () => {
    setSelectedCameraId(null)
    setViolationType("")
    setMinConfidence(null)
    setDateFrom("")
    setDateTo("")
    setPage(1)
  }

  const handleReviewComplete = (success: boolean, violationId?: number) => {
    if (success) {
      // Remove the reviewed detection from the list
      setDetections(prev => prev.filter(d => d.id !== selectedDetection?.id))
      setSelectedDetection(null)
      // Reload to get updated counts
      loadDetections()
    }
  }

  const getDetectionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      violation: "bg-red-100 text-red-800",
      license_plate: "bg-blue-100 text-blue-800",
      vehicle_count: "bg-green-100 text-green-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600"
    if (confidence >= 0.7) return "text-yellow-600"
    return "text-orange-600"
  }

  const formatDetectionTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: vi })
  }

  const totalPages = Math.ceil(total / limit)

  if (selectedDetection) {
    return (
      <div className={className}>
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setSelectedDetection(null)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
        
        <DetectionReviewInterface
          detection={selectedDetection}
          onReviewComplete={handleReviewComplete}
          onCancel={() => setSelectedDetection(null)}
        />
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Xem xét phát hiện AI
            </span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {total} phát hiện chờ xử lý
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Camera Filter */}
            <div className="space-y-2">
              <Label>Camera</Label>
              <Select 
                value={selectedCameraId?.toString() || "all"} 
                onValueChange={(value) => {
                  setSelectedCameraId(value === "all" ? null : parseInt(value))
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả camera</SelectItem>
                  {cameras.map((camera) => (
                    <SelectItem key={camera.id} value={camera.id.toString()}>
                      {camera.name} ({camera.camera_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Violation Type Filter */}
            <div className="space-y-2">
              <Label>Loại vi phạm</Label>
              <Select 
                value={violationType || "all"} 
                onValueChange={(value) => {
                  setViolationType(value === "all" ? "" : value)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="speeding">Vượt tốc độ</SelectItem>
                  <SelectItem value="red_light">Vượt đèn đỏ</SelectItem>
                  <SelectItem value="wrong_lane">Sai làn đường</SelectItem>
                  <SelectItem value="no_helmet">Không đội mũ bảo hiểm</SelectItem>
                  <SelectItem value="parking_violation">Vi phạm đỗ xe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Confidence Filter */}
            <div className="space-y-2">
              <Label>Độ tin cậy tối thiểu</Label>
              <Select 
                value={minConfidence?.toString() || "all"} 
                onValueChange={(value) => {
                  setMinConfidence(value === "all" ? null : parseFloat(value))
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="0.9">≥ 90%</SelectItem>
                  <SelectItem value="0.8">≥ 80%</SelectItem>
                  <SelectItem value="0.7">≥ 70%</SelectItem>
                  <SelectItem value="0.6">≥ 60%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <Button variant="outline" onClick={handleResetFilters} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Đặt lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detection List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Danh sách phát hiện</span>
            <Button variant="outline" size="sm" onClick={loadDetections} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Đang tải...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : detections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Không có phát hiện nào cần xem xét</p>
              <p className="text-sm">Tất cả phát hiện đã được xử lý hoặc không có dữ liệu mới</p>
            </div>
          ) : (
            <div className="space-y-4">
              {detections.map((detection) => {
                const camera = cameras.find(c => c.id === detection.video_id) // This might need adjustment based on your data structure
                
                return (
                  <Card key={detection.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-center gap-3">
                            <Badge className={getDetectionTypeColor(detection.detection_type)}>
                              {detection.detection_type}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDetectionTime(detection.detected_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              <span className={`font-semibold ${getConfidenceColor(detection.confidence)}`}>
                                {(detection.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          {/* Detection Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {detection.data.license_plate && (
                              <div>
                                <span className="text-muted-foreground">Biển số: </span>
                                <span className="font-mono font-semibold">{detection.data.license_plate}</span>
                              </div>
                            )}
                            {detection.data.violation_type && (
                              <div>
                                <span className="text-muted-foreground">Vi phạm: </span>
                                <span className="font-medium text-red-600">{detection.data.violation_type}</span>
                              </div>
                            )}
                            {detection.data.vehicle_type && (
                              <div>
                                <span className="text-muted-foreground">Loại xe: </span>
                                <span>{detection.data.vehicle_type}</span>
                              </div>
                            )}
                            {detection.data.vehicle_color && (
                              <div>
                                <span className="text-muted-foreground">Màu xe: </span>
                                <span>{detection.data.vehicle_color}</span>
                              </div>
                            )}
                          </div>

                          {/* Video Info */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Video className="h-3 w-3" />
                            <span>Video ID: {detection.video_id}</span>
                            <span>•</span>
                            <span>Timestamp: {detection.timestamp.toFixed(1)}s</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          onClick={() => setSelectedDetection(detection)}
                          className="ml-4"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem xét
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} của {total} phát hiện
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>
                  <span className="text-sm">
                    Trang {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}