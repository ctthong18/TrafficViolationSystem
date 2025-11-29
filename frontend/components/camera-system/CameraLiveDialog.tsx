"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera } from "@/lib/api"
import { useCameraLatestVideo } from "@/hooks/useCameraLatestVideo"

interface CameraLiveDialogProps {
  camera: Camera | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CameraLiveDialog({ camera, open, onOpenChange }: CameraLiveDialogProps) {
  // Ensure camera ID is a number
  const cameraId = camera?.id ? (typeof camera.id === 'number' ? camera.id : parseInt(camera.id, 10)) : null
  
  // Fetch latest video from camera
  const { video, loading, error } = useCameraLatestVideo(cameraId)
  
  if (!camera) return null

  // Use cloudinary_url from latest video
  const liveStreamUrl = video?.cloudinary_url || null
  const hasLiveStream = !!liveStreamUrl
  
  // Debug logging
  if (open && video) {
    console.log('[CameraLiveDialog] Video loaded:', {
      video_id: video.id,
      camera_id: video.camera_id,
      cloudinary_url: video.cloudinary_url,
      processing_status: video.processing_status,
      has_violations: video.has_violations
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{camera.name}</span>
            <span className="text-sm text-muted-foreground">({camera.camera_id})</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Vị trí:</strong> {camera.location_name || 'Không rõ'}</p>
            {camera.address && <p><strong>Địa chỉ:</strong> {camera.address}</p>}
            <p><strong>Trạng thái:</strong> 
              <span className={`ml-1 capitalize ${
                camera.status === 'online' ? 'text-green-600' : 
                camera.status === 'offline' ? 'text-red-600' : 
                'text-yellow-600'
              }`}>
                {camera.status === 'online' ? 'Hoạt động' : 
                 camera.status === 'offline' ? 'Ngoại tuyến' : 'Bảo trì'}
              </span>
            </p>
          </div>

          {loading ? (
            <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                </div>
                <p className="text-lg font-medium">Đang tải video...</p>
              </div>
            </div>
          ) : error ? (
            <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                </div>
                <p className="text-lg font-medium">Lỗi tải video</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : hasLiveStream && camera.status === 'online' ? (
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden relative">
              {liveStreamUrl.includes('cloudinary.com') ? (
                // Cloudinary video
                <video
                  src={liveStreamUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted
                  loop
                  title={`Video ${camera.name}`}
                  onError={(e) => {
                    console.error('Video load error for URL:', liveStreamUrl)
                    console.error('Error event:', e)
                  }}
                >
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
              ) : liveStreamUrl.includes('youtube.com') || liveStreamUrl.includes('youtu.be') ? (
                // YouTube embed
                <iframe
                  src={liveStreamUrl.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Live stream ${camera.name}`}
                />
              ) : liveStreamUrl.includes('.m3u8') ? (
                // HLS stream
                <video
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted
                  title={`Live stream ${camera.name}`}
                  onLoadStart={(e) => {
                    // For HLS streams, you might need hls.js library
                    const video = e.target as HTMLVideoElement
                    video.src = liveStreamUrl
                  }}
                >
                  <source src={liveStreamUrl} type="application/x-mpegURL" />
                  Trình duyệt của bạn không hỗ trợ HLS streaming.
                </video>
              ) : (
                // Generic video stream
                <video
                  src={liveStreamUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted
                  title={`Live stream ${camera.name}`}
                >
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
              )}
              
              {/* Video info indicator */}
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  VIDEO
                </div>
              </div>
              
              {/* Video metadata */}
              {video && (
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded text-xs">
                  <p>Tải lên: {new Date(video.uploaded_at).toLocaleString('vi-VN')}</p>
                  {video.duration && <p>Thời lượng: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</p>}
                </div>
              )}
            </div>
          ) : camera.status === 'offline' ? (
            <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                </div>
                <p className="text-lg font-medium">Camera ngoại tuyến</p>
                <p className="text-sm">Camera này hiện không hoạt động</p>
                <p className="text-xs mt-2">Vui lòng kiểm tra kết nối hoặc liên hệ kỹ thuật</p>
              </div>
            </div>
          ) : camera.status === 'maintenance' ? (
            <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
                </div>
                <p className="text-lg font-medium">Camera đang bảo trì</p>
                <p className="text-sm">Camera này tạm thời không khả dụng</p>
                <p className="text-xs mt-2">Dự kiến hoạt động trở lại sớm</p>
              </div>
            </div>
          ) : (
            <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
                </div>
                <p className="text-lg font-medium">Không có live stream</p>
                <p className="text-sm">Camera này chưa được cấu hình phát trực tiếp</p>
                <p className="text-xs mt-2">Vui lòng liên hệ quản trị viên để cấu hình</p>
              </div>
            </div>
          )}

          {/* Video info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Camera ID:</strong> {camera.camera_id}</p>
            {camera.violations_today !== undefined && (
              <p><strong>Vi phạm hôm nay:</strong> {camera.violations_today}</p>
            )}
            {camera.last_violation_at && (
              <p><strong>Vi phạm cuối:</strong> {new Date(camera.last_violation_at).toLocaleString('vi-VN')}</p>
            )}
            {video && (
              <>
                <p><strong>Video ID:</strong> {video.id}</p>
                <p><strong>Trạng thái xử lý:</strong> {
                  video.processing_status === 'completed' ? 'Hoàn thành' :
                  video.processing_status === 'processing' ? 'Đang xử lý' :
                  video.processing_status === 'failed' ? 'Thất bại' : 'Chờ xử lý'
                }</p>
                {video.has_violations && (
                  <p><strong>Phát hiện vi phạm:</strong> {video.violation_count} vi phạm</p>
                )}
                {liveStreamUrl && (
                  <p className="break-all"><strong>Video URL:</strong> {liveStreamUrl.substring(0, 60)}...</p>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
