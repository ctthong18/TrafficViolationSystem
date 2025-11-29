"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useVideos } from "@/hooks/useVideos"
import { useVideoDetections } from "@/hooks/useVideoDetections"
import { CameraVideo } from "@/lib/api"
import { VideoPlayer } from "./VideoPlayer"
import { VideoPlayerWithBoundingBoxes } from "./VideoPlayerWithBoundingBoxes"
import { VideoDetailsPanel } from "./VideoDetailsPanel"
import { 
  Video, 
  Grid3x3, 
  List, 
  Calendar as CalendarIcon,
  AlertCircle,
  Clock,
  FileVideo,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Safe date formatter helper
const safeFormatDate = (dateString: string | undefined | null, formatStr: string, options?: any): string => {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid Date"
    return format(date, formatStr, options)
  } catch (error) {
    console.error("Date formatting error:", error, "Date string:", dateString)
    return "Invalid Date"
  }
}

interface VideoLibraryProps {
  cameraId: number
  cameraName?: string
}

type ViewMode = "grid" | "list"
type SortOption = "date_desc" | "date_asc" | "duration_desc" | "duration_asc" | "violations_desc"

// Component to handle video dialog content with detections
function VideoDialogContent({ video }: { video: CameraVideo }) {
  const { detections, loading: detectionsLoading, error: detectionsError } = useVideoDetections(video.id)
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {/* Luôn hiển thị video với bounding boxes vì đây là video đã xử lý */}
        {detectionsLoading ? (
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <div className="text-white flex flex-col items-center gap-2">
              <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
              <p className="text-sm">Đang tải detections...</p>
            </div>
          </div>
        ) : detectionsError ? (
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <div className="text-destructive flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm">Lỗi tải detections: {detectionsError}</p>
            </div>
          </div>
        ) : (
          <VideoPlayerWithBoundingBoxes
            videoUrl={video.cloudinary_url}
            detections={detections}
            autoPlay
          />
        )}
      </div>
      <div className="lg:col-span-1">
        <VideoDetailsPanel 
          videoId={video.id}
          onViewViolation={(violationId) => {
            window.open(`/violations/${violationId}`, "_blank")
          }}
        />
      </div>
    </div>
  )
}

export function VideoLibrary({ cameraId, cameraName }: VideoLibraryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [hasViolationsFilter, setHasViolationsFilter] = useState<boolean | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [sortBy, setSortBy] = useState<SortOption>("date_desc")
  const [selectedVideo, setSelectedVideo] = useState<CameraVideo | null>(null)

  // Tạm thời không filter processing_status để debug, sau đó sẽ set lại thành "completed"
  const [showOnlyProcessed, setShowOnlyProcessed] = useState(true)
  
  const { videos, total, loading, error, refetch } = useVideos({
    cameraId,
    skip: (page - 1) * limit,
    limit,
    has_violations: hasViolationsFilter,
    processing_status: showOnlyProcessed ? "completed" : undefined, // Chỉ hiển thị video đã xử lý bởi AI
    date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
    date_to: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
  })

  // Sort videos client-side
  const sortedVideos = [...videos].sort((a, b) => {
    switch (sortBy) {
      case "date_desc":
        return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
      case "date_asc":
        return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
      case "duration_desc":
        return (b.duration || 0) - (a.duration || 0)
      case "duration_asc":
        return (a.duration || 0) - (b.duration || 0)
      case "violations_desc":
        return b.violation_count - a.violation_count
      default:
        return 0
    }
  })

  const totalPages = Math.ceil(total / limit)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const handleResetFilters = () => {
    setHasViolationsFilter(undefined)
    setDateFrom(undefined)
    setDateTo(undefined)
    setSortBy("date_desc")
    setPage(1)
  }

  if (loading && videos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Đang tải video...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">{error}</p>
          <Button onClick={refetch} variant="outline" className="mt-4">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Thư viện Video đã xử lý AI {cameraName && `- ${cameraName}`}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Hiển thị các video đã được xử lý bởi AI với bounding boxes, số lượng xe, biển số và thông tin phát hiện
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Violations Filter */}
            <Select
              value={hasViolationsFilter === undefined ? "all" : hasViolationsFilter ? "yes" : "no"}
              onValueChange={(value) => {
                setHasViolationsFilter(value === "all" ? undefined : value === "yes")
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc vi phạm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả video</SelectItem>
                <SelectItem value="yes">Có vi phạm</SelectItem>
                <SelectItem value="no">Không vi phạm</SelectItem>
              </SelectContent>
            </Select>

            {/* Date From */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-48 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: vi }) : "Từ ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(date) => {
                    setDateFrom(date)
                    setPage(1)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Date To */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-48 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: vi }) : "Đến ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={(date) => {
                    setDateTo(date)
                    setPage(1)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Mới nhất</SelectItem>
                <SelectItem value="date_asc">Cũ nhất</SelectItem>
                <SelectItem value="duration_desc">Dài nhất</SelectItem>
                <SelectItem value="duration_asc">Ngắn nhất</SelectItem>
                <SelectItem value="violations_desc">Nhiều vi phạm nhất</SelectItem>
              </SelectContent>
            </Select>

            {/* Toggle Processed Videos Only */}
            <Button 
              variant={showOnlyProcessed ? "default" : "outline"} 
              onClick={() => {
                setShowOnlyProcessed(!showOnlyProcessed)
                setPage(1)
              }}
            >
              {showOnlyProcessed ? "Chỉ video đã xử lý" : "Tất cả video"}
            </Button>

            {/* Reset Filters */}
            <Button variant="outline" onClick={handleResetFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Đặt lại
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Tìm thấy {total} video
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos Display */}
      {sortedVideos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileVideo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Không tìm thấy video nào</p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedVideos.map((video) => (
            <VideoCard key={video.id} video={video} onPlay={() => setSelectedVideo(video)} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedVideos.map((video) => (
            <VideoListItem key={video.id} video={video} onPlay={() => setSelectedVideo(video)} />
          ))}
        </div>
      )}

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Video - {selectedVideo && safeFormatDate(selectedVideo.uploaded_at, "dd/MM/yyyy HH:mm", { locale: vi })}
            </DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <VideoDialogContent video={selectedVideo} />
          )}
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Trước
              </Button>
              <div className="text-sm text-muted-foreground">
                Trang {page} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Sau
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Video Card Component (Grid View)
function VideoCard({ video, onPlay }: { video: CameraVideo; onPlay: () => void }) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Đang chờ" },
      processing: { variant: "default", label: "Đang xử lý" },
      completed: { variant: "outline", label: "Hoàn thành" },
      failed: { variant: "destructive", label: "Thất bại" },
    }
    return variants[status] || variants.pending
  }

  const statusInfo = getStatusBadge(video.processing_status)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video bg-muted">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileVideo className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {/* AI Processed Badge */}
        {video.processing_status === "completed" && (
          <Badge className="absolute top-2 left-2 bg-green-600">
            Đã xử lý AI
          </Badge>
        )}
        {video.has_violations && (
          <Badge className="absolute top-2 right-2 bg-destructive">
            {video.violation_count} vi phạm
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDuration(video.duration)}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {safeFormatDate(video.uploaded_at, "dd/MM/yyyy HH:mm", { locale: vi })}
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={onPlay}>
          <Video className="h-4 w-4 mr-2" />
          Xem video
        </Button>
      </CardContent>
    </Card>
  )
}

// Video List Item Component (List View)
function VideoListItem({ video, onPlay }: { video: CameraVideo; onPlay: () => void }) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Đang chờ" },
      processing: { variant: "default", label: "Đang xử lý" },
      completed: { variant: "outline", label: "Hoàn thành" },
      failed: { variant: "destructive", label: "Thất bại" },
    }
    return variants[status] || variants.pending
  }

  const statusInfo = getStatusBadge(video.processing_status)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Thumbnail */}
          <div className="relative w-32 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileVideo className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {video.processing_status === "completed" && (
                <Badge className="bg-green-600">Đã xử lý AI</Badge>
              )}
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              {video.has_violations && (
                <Badge variant="destructive">
                  {video.violation_count} vi phạm
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {safeFormatDate(video.uploaded_at, "dd/MM/yyyy HH:mm", { locale: vi })}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(video.duration)}
              </div>
              {video.format && (
                <div className="uppercase">{video.format}</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <Button variant="outline" size="sm" onClick={onPlay}>
            <Video className="h-4 w-4 mr-2" />
            Xem
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
