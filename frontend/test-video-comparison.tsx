/**
 * Test component to compare video loading between Dialog and Grid
 * Add this to a test page to debug video loading issues
 */

"use client"
import { useState } from 'react'
import { useCameraLatestVideo } from '@/hooks/useCameraLatestVideo'

export function VideoComparisonTest({ cameraId }: { cameraId: number }) {
  const { video, loading, error } = useCameraLatestVideo(cameraId)
  const [dialogVideoError, setDialogVideoError] = useState<string | null>(null)
  const [gridVideoError, setGridVideoError] = useState<string | null>(null)

  const videoUrl = video?.cloudinary_url || null

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Video Loading Comparison Test</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Camera ID:</strong> {cameraId}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Error:</strong> {error || 'None'}</p>
          <p><strong>Video ID:</strong> {video?.id || 'N/A'}</p>
          <p><strong>Video URL:</strong> {videoUrl || 'N/A'}</p>
          <p><strong>Processing Status:</strong> {video?.processing_status || 'N/A'}</p>
        </div>
      </div>

      {/* Dialog Style Video */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Dialog Style (Working)</h3>
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden relative">
          {loading ? (
            <div className="flex items-center justify-center w-full h-full text-white">
              Đang tải...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center w-full h-full text-red-500">
              Lỗi: {error}
            </div>
          ) : videoUrl ? (
            <video
              src={videoUrl}
              className="w-full h-full object-contain"
              controls
              autoPlay
              muted
              loop
              onError={(e) => {
                console.error('[DIALOG STYLE] Video error:', e)
                setDialogVideoError('Video load failed')
              }}
              onLoadedData={() => {
                console.log('[DIALOG STYLE] Video loaded successfully')
                setDialogVideoError(null)
              }}
            >
              Trình duyệt không hỗ trợ video
            </video>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-white">
              Không có video
            </div>
          )}
          {dialogVideoError && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded">
              {dialogVideoError}
            </div>
          )}
        </div>
      </div>

      {/* Grid Style Video */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Grid Style (Issue)</h3>
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden relative">
          {loading ? (
            <div className="flex items-center justify-center w-full h-full text-white">
              Đang tải...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center w-full h-full text-red-500">
              Lỗi: {error}
            </div>
          ) : videoUrl ? (
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              onError={(e) => {
                console.error('[GRID STYLE] Video error:', e)
                setGridVideoError('Video load failed')
              }}
              onLoadedData={() => {
                console.log('[GRID STYLE] Video loaded successfully')
                setGridVideoError(null)
              }}
            >
              Trình duyệt không hỗ trợ video
            </video>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-white">
              Không có video
            </div>
          )}
          {gridVideoError && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded">
              {gridVideoError}
            </div>
          )}
        </div>
      </div>

      {/* Differences */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
        <h3 className="font-semibold mb-2">Key Differences:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Dialog: <code>object-contain</code> + <code>controls</code></li>
          <li>Grid: <code>object-cover</code> + <code>playsInline</code></li>
          <li>Both use same hook and video URL</li>
        </ul>
      </div>
    </div>
  )
}

// Usage example:
// import { VideoComparisonTest } from '@/test-video-comparison'
// <VideoComparisonTest cameraId={1} />
