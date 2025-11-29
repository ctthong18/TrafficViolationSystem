"use client"

import { useCameraLatestVideo } from "@/hooks/useCameraLatestVideo"

interface CameraItem {
  id: number | string
  camera_id?: string
  name?: string
  status?: string
  location_name?: string
  // Add numeric_id if backend provides it separately
  numeric_id?: number
}

// ---- Component Item ----
function CameraGridItem({ camera }: { camera: CameraItem }) {

  // Parse cameraId - handle multiple cases:
  // 1. If numeric_id exists, use it
  // 2. If id is already a number, use it
  // 3. If id is a numeric string (like "1", "2"), parse it
  // 4. If id is "CAM_XX", extract the number
  // 5. Otherwise, return null
  let cameraId: number | null = null
  
  if (camera.numeric_id) {
    cameraId = camera.numeric_id
  } else if (typeof camera.id === 'number') {
    cameraId = camera.id
  } else if (typeof camera.id === 'string') {
    // Try to parse as number first
    const parsed = parseInt(camera.id, 10)
    if (!isNaN(parsed)) {
      cameraId = parsed
    } else if (camera.id.startsWith('CAM_')) {
      // Extract number from CAM_XX format
      const numPart = camera.id.replace('CAM_', '')
      const extracted = parseInt(numPart, 10)
      if (!isNaN(extracted)) {
        cameraId = extracted
      }
    }
  }

  console.log("[GRID] Camera:", camera)
  console.log("[GRID] Parsed cameraId:", cameraId)
  console.log("[GRID] Camera ID type:", typeof camera.id, "Value:", camera.id)

  const { video, loading, error } = useCameraLatestVideo(cameraId)

  const videoUrl = video?.cloudinary_url || null
  const hasVideo = !!videoUrl

  // Debug logging
  if (video) {
    console.log('[GRID] Video loaded for camera:', {
      camera_id: camera.id,
      video_id: video.id,
      cloudinary_url: video.cloudinary_url,
      processing_status: video.processing_status
    })
  }

  return (
    <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center w-full h-full text-gray-400">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Đang tải video...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center w-full h-full text-red-500">
          <div className="text-center px-4">
            <p className="font-medium">Lỗi tải video</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      ) : hasVideo ? (
        <video
          src={videoUrl}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          onError={(e) => {
            console.error('[GRID] Video load error for camera:', camera.id)
            console.error('[GRID] Video URL:', videoUrl)
            console.error('[GRID] Error event:', e)
          }}
          onLoadedData={() => {
            console.log('[GRID] Video loaded successfully for camera:', camera.id)
          }}
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      ) : (
        <div className="flex items-center justify-center w-full h-full text-gray-400">
          <div className="text-center">
            <p>Không có video</p>
            <p className="text-xs mt-1">Camera chưa có video nào</p>
          </div>
        </div>
      )}

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3 text-sm">
        <div className="flex justify-between items-center">
          <span>{camera.name || "Camera"}</span>

          <div
            className={`w-2 h-2 rounded-full ${
              camera.status === "online"
                ? "bg-green-400"
                : camera.status === "offline"
                ? "bg-red-400"
                : "bg-yellow-400"
            }`}
          />
        </div>

        {camera.location_name && (
          <p className="text-xs opacity-70 mt-1">{camera.location_name}</p>
        )}
      </div>
    </div>
  )
}

// ---- MAIN GRID ----
export function CameraLiveGrid({ cameras }: { cameras: CameraItem[] }) {
  if (!cameras || cameras.length === 0) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cameras.map((cam, i) => (
        <CameraGridItem key={i} camera={cam} />
      ))}
    </div>
  )
}
