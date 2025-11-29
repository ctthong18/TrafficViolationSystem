"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize,
  Loader2
} from "lucide-react"

interface BoundingBox {
  x1: number
  y1: number
  x2: number
  y2: number
  class_id: number
  class_name: string
  confidence: number
  track_id?: number
  license_plate?: string
}

interface Detection {
  id: number
  timestamp: number
  confidence: number
  data: {
    bounding_boxes?: BoundingBox[]
    license_plate?: string
    vehicle_type?: string
    vehicle_count?: number
    violation_type?: string
  }
}

interface VideoPlayerWithBoundingBoxesProps {
  videoUrl: string
  detections?: Detection[]
  autoPlay?: boolean
  className?: string
}

// Vehicle class colors (matching Test/main.py)
const VEHICLE_COLORS: Record<number, string> = {
  2: '#00FF00',  // car - green
  3: '#FF0000',  // motorcycle - red
  5: '#0000FF',  // bus - blue
  7: '#00FFFF',  // truck - cyan
  0: '#00A5FF',  // person - orange
}

const VEHICLE_NAMES: Record<number, string> = {
  2: 'car',
  3: 'motorcycle',
  5: 'bus',
  7: 'truck',
  0: 'person',
}

export function VideoPlayerWithBoundingBoxes({ 
  videoUrl, 
  detections = [], 
  autoPlay = false,
  className = ""
}: VideoPlayerWithBoundingBoxesProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [currentDetections, setCurrentDetections] = useState<Detection[]>([])

  // Draw bounding boxes on canvas
  const drawBoundingBoxes = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) {
      console.log('[BBox] Missing video or canvas', { video: !!video, canvas: !!canvas })
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('[BBox] No canvas context')
      return
    }

    // Set canvas size to match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 1920
      canvas.height = video.videoHeight || 1080
      console.log('[BBox] Canvas resized:', { width: canvas.width, height: canvas.height })
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // DEBUG: Draw test box to verify canvas is working
    if (video.currentTime < 1) {
      ctx.strokeStyle = '#00FF00'
      ctx.lineWidth = 5
      ctx.strokeRect(50, 50, 200, 150)
      ctx.fillStyle = '#00FF00'
      ctx.fillRect(50, 30, 150, 20)
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 14px Arial'
      ctx.fillText('CANVAS TEST', 55, 45)
      console.log('[BBox] Test box drawn at start')
    }

    // Find detections for current time (within 0.5 seconds)
    const activeDetections = detections.filter(
      d => Math.abs(d.timestamp - video.currentTime) < 0.5
    )

    if (activeDetections.length > 0) {
      console.log('[BBox] Active detections:', activeDetections.length, 'at time:', video.currentTime)
    }

    setCurrentDetections(activeDetections)

    // Draw each detection's bounding boxes
    activeDetections.forEach(detection => {
      const boxes = detection.data.bounding_boxes || []
      
      console.log('[BBox] Drawing', boxes.length, 'boxes for detection', detection.id)
      
      boxes.forEach(box => {
        const color = VEHICLE_COLORS[box.class_id] || '#FFFFFF'
        const className = box.class_name || VEHICLE_NAMES[box.class_id] || 'unknown'
        
        console.log('[BBox] Box:', { x1: box.x1, y1: box.y1, x2: box.x2, y2: box.y2, color, className })
        
        // Draw rectangle
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.strokeRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1)
        
        // Prepare label
        let label = className
        if (box.track_id !== undefined && box.track_id !== -1) {
          label = `${className} #${box.track_id}`
        } else {
          label = `${className} (${(box.confidence * 100).toFixed(0)}%)`
        }
        
        if (box.license_plate) {
          label += ` - ${box.license_plate}`
        }
        
        // Draw label background
        ctx.font = '16px Arial'
        const textMetrics = ctx.measureText(label)
        const textWidth = textMetrics.width
        const textHeight = 20
        
        ctx.fillStyle = color
        ctx.fillRect(box.x1, box.y1 - textHeight - 5, textWidth + 10, textHeight + 5)
        
        // Draw label text
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(label, box.x1 + 5, box.y1 - 8)
      })
    })

    // Continue animation loop if playing
    if (!video.paused && !video.ended) {
      animationFrameRef.current = requestAnimationFrame(drawBoundingBoxes)
    }
  }

  // Initialize video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setLoading(false)
      if (autoPlay) {
        video.play().catch(err => console.error("Autoplay failed:", err))
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      drawBoundingBoxes()
    }

    const handlePlay = () => {
      setIsPlaying(true)
      drawBoundingBoxes()
    }
    
    const handlePause = () => {
      setIsPlaying(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("ended", handleEnded)
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [autoPlay, detections])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const time = parseFloat(e.target.value)
    video.currentTime = time
    setCurrentTime(time)
    drawBoundingBoxes()
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = parseFloat(e.target.value)
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume || 0.5
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = async () => {
    const container = containerRef.current
    if (!container) return

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error("Fullscreen error:", error)
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          className="relative bg-black group"
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Video and Canvas Container */}
          <div className="relative aspect-video">
            {/* Video Element (hidden, used as source) */}
            <video
              ref={videoRef}
              src={videoUrl}
              className="absolute inset-0 w-full h-full"
              onClick={togglePlay}
            />
            
            {/* Canvas for drawing bounding boxes */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
          )}

          {/* Controls Overlay */}
          <div 
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Detection Info Overlay */}
            {currentDetections.length > 0 && (
              <div className="absolute top-4 right-4 space-y-2">
                {currentDetections.map((detection, idx) => {
                  // Count vehicles by type
                  const boxes = detection.data.bounding_boxes || []
                  const vehicleCounts = boxes.reduce((acc, box) => {
                    const type = box.class_name || VEHICLE_NAMES[box.class_id] || 'unknown'
                    acc[type] = (acc[type] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                  
                  return (
                    <div key={idx} className="bg-black/90 text-white px-4 py-3 rounded-lg shadow-xl text-sm space-y-2">
                        <div className="font-semibold border-b border-white/20 pb-2">
                        Total Detections: {boxes.length}
                      </div>
                      
                      {/* Vehicle counts by type */}
                      {Object.keys(vehicleCounts).length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-gray-300">Vehicle Counts:</div>
                          {Object.entries(vehicleCounts).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between text-xs">
                              <span className="capitalize flex items-center gap-1">
                                <div 
                                  className="w-2 h-2 rounded-sm" 
                                  style={{ 
                                    backgroundColor: VEHICLE_COLORS[
                                      Object.entries(VEHICLE_NAMES).find(([_, name]) => name === type)?.[0] as any
                                    ] || '#FFFFFF' 
                                  }}
                                />
                                {type}
                              </span>
                              <span className="font-semibold">{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {detection.data.license_plate && (
                        <div className="text-xs font-mono text-blue-400 pt-2 border-t border-white/20">
                          Plate: {detection.data.license_plate}
                        </div>
                      )}
                      {detection.data.violation_type && (
                        <div className="text-xs text-red-400">
                          {detection.data.violation_type.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              {/* Progress Bar */}
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-mono min-w-[45px]">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
                <span className="text-white text-sm font-mono min-w-[45px]">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                  </div>
                </div>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs space-y-1">
            <div className="font-semibold mb-1">Vehicle Types:</div>
            {Object.entries(VEHICLE_NAMES).map(([id, name]) => (
              <div key={id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: VEHICLE_COLORS[parseInt(id)] }}
                />
                <span className="capitalize">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
