"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings,
  Loader2
} from "lucide-react"

interface Detection {
  id: number
  type: string
  confidence: number
  frame_timestamp: number
  data: any
}

interface VideoPlayerProps {
  videoUrl: string
  detections?: Detection[]
  onSeek?: (timestamp: number) => void
  autoPlay?: boolean
  className?: string
}

export function VideoPlayer({ 
  videoUrl, 
  detections = [], 
  onSeek,
  autoPlay = false,
  className = ""
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState("auto")
  const [loading, setLoading] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [hoveredDetection, setHoveredDetection] = useState<Detection | null>(null)
  const [currentDetection, setCurrentDetection] = useState<Detection | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

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
      const time = video.currentTime
      setCurrentTime(time)
      
      // Find current detection (within 0.5 seconds)
      const activeDetection = detections.find(
        d => Math.abs(d.frame_timestamp - time) < 0.5
      )
      setCurrentDetection(activeDetection || null)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

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
    }
  }, [autoPlay])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    } else {
      setShowControls(true)
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying, currentTime])

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

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
    onSeek?.(time)
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
      if (!isFullscreen) {
        await container.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error("Fullscreen error:", error)
    }
  }

  const handlePlaybackRateChange = (rate: string) => {
    const video = videoRef.current
    if (!video) return

    const rateValue = parseFloat(rate)
    video.playbackRate = rateValue
    setPlaybackRate(rateValue)
  }

  const handleQualityChange = (newQuality: string) => {
    const video = videoRef.current
    if (!video) return

    const currentTime = video.currentTime
    const wasPlaying = !video.paused
    
    setQuality(newQuality)
    
    // Transform Cloudinary URL for different quality
    let newVideoUrl = videoUrl
    if (videoUrl.includes('cloudinary.com')) {
      // Extract the base URL and add quality transformation
      const baseUrl = videoUrl.split('/upload/')[0] + '/upload/'
      const videoPath = videoUrl.split('/upload/')[1]
      
      let qualityTransform = ''
      switch (newQuality) {
        case '1080p':
          qualityTransform = 'q_auto,h_1080/'
          break
        case '720p':
          qualityTransform = 'q_auto,h_720/'
          break
        case '480p':
          qualityTransform = 'q_auto,h_480/'
          break
        case '360p':
          qualityTransform = 'q_auto,h_360/'
          break
        default:
          qualityTransform = 'q_auto/'
      }
      
      newVideoUrl = baseUrl + qualityTransform + videoPath
    }
    
    // Update video source and restore playback position
    video.src = newVideoUrl
    video.currentTime = currentTime
    
    if (wasPlaying) {
      video.play().catch(err => console.error("Failed to resume playback:", err))
    }
  }

  const seekToDetection = (timestamp: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = timestamp
    setCurrentTime(timestamp)
    onSeek?.(timestamp)
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getDetectionColor = (type: string) => {
    const colors: Record<string, string> = {
      violation: "bg-red-500",
      license_plate: "bg-blue-500",
      vehicle_count: "bg-green-500",
    }
    return colors[type] || "bg-gray-500"
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          className="relative bg-black group"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full aspect-video"
            onClick={togglePlay}
          />

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
            {/* Detection Markers on Timeline */}
            {detections.length > 0 && duration > 0 && (
              <div className="absolute bottom-20 left-4 right-4">
                <div className="relative h-2">
                  {detections.map((detection) => {
                    const isActive = currentDetection?.id === detection.id
                    const isHovered = hoveredDetection?.id === detection.id
                    
                    return (
                      <div
                        key={detection.id}
                        className="absolute"
                        style={{ left: `${(detection.frame_timestamp / duration) * 100}%` }}
                        onMouseEnter={() => setHoveredDetection(detection)}
                        onMouseLeave={() => setHoveredDetection(null)}
                      >
                        {/* Marker Button */}
                        <button
                          className={`w-3 h-3 rounded-full transition-all duration-200 ${getDetectionColor(detection.type)} ${
                            isActive 
                              ? 'scale-150 ring-2 ring-white shadow-lg' 
                              : isHovered 
                              ? 'scale-125' 
                              : 'scale-100'
                          }`}
                          onClick={() => seekToDetection(detection.frame_timestamp)}
                          aria-label={`Jump to ${detection.type} detection at ${formatTime(detection.frame_timestamp)}`}
                        />
                        
                        {/* Hover Tooltip */}
                        {isHovered && (
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/90 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="text-xs font-semibold mb-1 capitalize">
                              {detection.type.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-gray-300">
                              Confidence: {Math.round(detection.confidence * 100)}%
                            </div>
                            <div className="text-xs text-gray-400">
                              Time: {formatTime(detection.frame_timestamp)}
                            </div>
                            {detection.data?.violation_type && (
                              <div className="text-xs text-red-400 mt-1">
                                {detection.data.violation_type.replace('_', ' ')}
                              </div>
                            )}
                            {detection.data?.license_plate && (
                              <div className="text-xs text-blue-400 mt-1">
                                Plate: {detection.data.license_plate}
                              </div>
                            )}
                            {/* Tooltip Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
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
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
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

                  {/* Playback Speed */}
                  <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
                    <SelectTrigger className="w-20 h-8 bg-white/10 text-white border-white/20 hover:bg-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Quality Selector */}
                  <Select value={quality} onValueChange={handleQualityChange}>
                    <SelectTrigger className="w-24 h-8 bg-white/10 text-white border-white/20 hover:bg-white/20">
                      <Settings className="h-4 w-4 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="480p">480p</SelectItem>
                      <SelectItem value="360p">360p</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Current Detection Info Overlay */}
          {currentDetection && (
            <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-right-5 duration-300">
              <div className={`${getDetectionColor(currentDetection.type)} text-white px-4 py-3 rounded-lg shadow-xl space-y-1`}>
                <div className="font-semibold text-sm capitalize">
                  {currentDetection.type.replace('_', ' ')}
                </div>
                <div className="text-xs opacity-90">
                  Confidence: {Math.round(currentDetection.confidence * 100)}%
                </div>
                {currentDetection.data?.violation_type && (
                  <div className="text-xs font-medium mt-2 pt-2 border-t border-white/20">
                    {currentDetection.data.violation_type.replace('_', ' ')}
                  </div>
                )}
                {currentDetection.data?.license_plate && (
                  <div className="text-xs font-mono mt-1">
                    {currentDetection.data.license_plate}
                  </div>
                )}
                {currentDetection.data?.vehicle_type && (
                  <div className="text-xs capitalize mt-1">
                    {currentDetection.data.vehicle_type}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
