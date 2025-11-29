"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Video,
  Calendar,
  Clock,
  HardDrive,
  FileVideo,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  Loader2,
  MapPin,
  Sparkles,
  RefreshCw
} from "lucide-react"
import { format } from "date-fns"
import apiClient, { CameraVideo } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

// Safe date formatter helper
const safeFormatDate = (dateString: string | undefined | null, formatStr: string): string => {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid Date"
    return format(date, formatStr)
  } catch (error) {
    console.error("Date formatting error:", error, "Date string:", dateString)
    return "Invalid Date"
  }
}

interface Detection {
  id: number
  detection_type: string
  timestamp: number
  confidence: number
  data: any
  detected_at: string
  reviewed: boolean
  review_status?: string
  violation_id?: number
}

interface Camera {
  id: number
  camera_id: string
  name: string
  location_name: string
  address?: string
}

interface VideoDetailsPanelProps {
  videoId: number
  className?: string
  onViewViolation?: (violationId: number) => void
}

export function VideoDetailsPanel({ 
  videoId, 
  className = "",
  onViewViolation
}: VideoDetailsPanelProps) {
  const [video, setVideo] = useState<CameraVideo | null>(null)
  const [camera, setCamera] = useState<Camera | null>(null)
  const [detections, setDetections] = useState<Detection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchVideoDetails()
  }, [videoId])

  const fetchVideoDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch video details
      const videoData = await apiClient.get<CameraVideo>(`/v1/videos/${videoId}`)
      setVideo(videoData)

      // Fetch camera details - need to find camera by numeric ID
      const camerasResponse = await apiClient.get<{items: Camera[]}>(`/v1/cameras`)
      const cameraData = camerasResponse.items.find(c => c.id === videoData.camera_id)
      setCamera(cameraData || null)

      // Fetch detections for this video
      const detectionsData = await apiClient.get<{ video_id: number; total_detections: number; detections: Detection[] }>(
        `/v1/videos/${videoId}/detections`
      )
      setDetections(detectionsData.detections)
    } catch (err: any) {
      console.error("Error fetching video details:", err)
      setError(err.message || "Failed to load video details")
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A"
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      processing: "bg-blue-500",
      completed: "bg-green-500",
      failed: "bg-red-500",
    }
    return colors[status] || "bg-gray-500"
  }

  const getDetectionTypeIcon = (type: string) => {
    switch (type) {
      case "violation":
        return <AlertTriangle className="h-4 w-4" />
      case "license_plate":
        return <FileVideo className="h-4 w-4" />
      case "vehicle_count":
        return <Video className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const getReviewStatusIcon = (status?: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`
  }

  const handleViewViolation = (violationId: number) => {
    if (onViewViolation) {
      onViewViolation(violationId)
    } else {
      // Default behavior: navigate to violation page
      window.open(`/violations/${violationId}`, "_blank")
    }
  }

  const handleAnalyzeVideo = async () => {
    setAnalyzing(true)
    try {
      const response = await apiClient.post<{
        job_id: number
        status: string
        video_id: number
        message: string
      }>(`/v1/videos/${videoId}/analyze`)
      
      toast({
        title: "Video đang được xử lý",
        description: response.message || "Video đã được đưa vào hàng đợi để phân tích AI",
      })
      
      // Refresh video details after a short delay
      setTimeout(() => {
        fetchVideoDetails()
      }, 2000)
    } catch (err: any) {
      console.error("Error analyzing video:", err)
      toast({
        title: "Lỗi phân tích video",
        description: err.message || "Không thể phân tích video. Vui lòng thử lại.",
        variant: "destructive"
      })
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error || !video) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p>{error || "Video not found"}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const violationDetections = detections.filter(d => d.detection_type === "violation")
  const approvedViolations = violationDetections.filter(d => d.review_status === "approved")

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Details
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchVideoDetails}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {video && (video.processing_status === 'pending' || video.processing_status === 'failed') && (
              <Button
                size="sm"
                onClick={handleAnalyzeVideo}
                disabled={analyzing}
                className="gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Phân tích AI
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Metadata */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Metadata
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Camera Info */}
            {camera && (
              <div className="col-span-2 space-y-1">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{camera.name}</p>
                    <p className="text-xs text-muted-foreground">{camera.location_name}</p>
                    {camera.address && (
                      <p className="text-xs text-muted-foreground">{camera.address}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Upload Date */}
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Uploaded</p>
                <p className="text-sm font-medium">
                  {safeFormatDate(video.uploaded_at, "MMM dd, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {safeFormatDate(video.uploaded_at, "HH:mm:ss")}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium">{formatDuration(video.duration)}</p>
              </div>
            </div>

            {/* File Size */}
            <div className="flex items-start gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">File Size</p>
                <p className="text-sm font-medium">{formatFileSize(video.file_size)}</p>
              </div>
            </div>

            {/* Format */}
            <div className="flex items-start gap-2">
              <FileVideo className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Format</p>
                <p className="text-sm font-medium uppercase">{video.format || "N/A"}</p>
              </div>
            </div>

            {/* Processing Status */}
            <div className="col-span-2 flex items-start gap-2">
              <div className={`h-4 w-4 rounded-full ${getStatusColor(video.processing_status)} mt-0.5`} />
              <div>
                <p className="text-xs text-muted-foreground">Processing Status</p>
                <p className="text-sm font-medium capitalize">{video.processing_status}</p>
                {video.processed_at && (
                  <p className="text-xs text-muted-foreground">
                    Completed: {format(new Date(video.processed_at), "MMM dd, HH:mm")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Detection Summary */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Detection Summary
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{detections.length}</p>
              <p className="text-xs text-muted-foreground">Total Detections</p>
            </div>
            <div className="text-center p-3 bg-destructive/10 rounded-lg">
              <p className="text-2xl font-bold text-destructive">{violationDetections.length}</p>
              <p className="text-xs text-muted-foreground">Violations</p>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{approvedViolations.length}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Detections List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            All Detections ({detections.length})
          </h3>
          
          {detections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No detections found for this video</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {detections.map((detection) => (
                  <Card key={detection.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          {/* Detection Type and Timestamp */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant={detection.detection_type === "violation" ? "destructive" : "default"} 
                              className="gap-1"
                            >
                              {getDetectionTypeIcon(detection.detection_type)}
                              <span className="capitalize">{detection.detection_type.replace("_", " ")}</span>
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              @ {formatTimestamp(detection.timestamp)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(detection.confidence * 100)}% confidence
                            </Badge>
                          </div>

                          {/* Detection Data */}
                          <div className="text-sm space-y-1">
                            {detection.data?.violation_type && (
                              <p className="font-medium text-destructive">
                                {detection.data.violation_type.replace("_", " ").toUpperCase()}
                              </p>
                            )}
                            {detection.data?.license_plate && (
                              <p className="font-mono">
                                Plate: <span className="font-bold">{detection.data.license_plate}</span>
                              </p>
                            )}
                            {detection.data?.vehicle_type && (
                              <p className="text-muted-foreground capitalize">
                                Vehicle: {detection.data.vehicle_type}
                              </p>
                            )}
                            {detection.detection_type === "vehicle_count" && detection.data && (
                              <div className="flex gap-4 text-xs">
                                {Object.entries(detection.data).map(([key, value]) => (
                                  <span key={key} className="capitalize">
                                    {key}: <span className="font-semibold">{value as number}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Review Status */}
                          <div className="flex items-center gap-2">
                            {getReviewStatusIcon(detection.review_status)}
                            <span className="text-xs text-muted-foreground capitalize">
                              {detection.review_status || "Not reviewed"}
                            </span>
                            {detection.reviewed && (
                              <span className="text-xs text-muted-foreground">
                                • {format(new Date(detection.detected_at), "MMM dd, HH:mm")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {detection.violation_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewViolation(detection.violation_id!)}
                            className="gap-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Violation
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
