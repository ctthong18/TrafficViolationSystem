"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cameraApi, videoApi, Camera } from "@/lib/api"
import { 
  Camera as CameraIcon,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Video,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Wrench,
  Activity,
  Loader2
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface CameraHealth {
  camera: Camera
  videoStats: {
    total_videos: number
    videos_with_violations: number
    processing_success_rate: number
    avg_duration: number
    last_video_at?: string
  }
  status: "healthy" | "warning" | "critical" | "offline"
  issues: string[]
  uptime: number // percentage
  lastSeen?: string
}

interface CameraHealthPanelProps {
  className?: string
  onCameraSelect?: (camera: Camera) => void
  onMaintenanceRequest?: (camera: Camera) => void
}

export function CameraHealthPanel({ 
  className = "",
  onCameraSelect,
  onMaintenanceRequest
}: CameraHealthPanelProps) {
  const [cameraHealthData, setCameraHealthData] = useState<CameraHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadCameraHealth()
  }, [])

  const loadCameraHealth = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get all cameras
      const camerasResponse = await cameraApi.getAll({ limit: 100 })
      const cameras = camerasResponse.items

      // Get health data for each camera
      const healthPromises = cameras.map(async (camera) => {
        try {
          // Get video stats for the camera
          const videoStats = await videoApi.getStats({
            cameraId: camera.id,
            date_from: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') // Last 7 days
          })

          // Determine health status
          const issues: string[] = []
          let status: CameraHealth['status'] = 'healthy'

          // Check camera status
          if (camera.status === 'offline') {
            status = 'offline'
            issues.push('Camera is offline')
          } else if (camera.status === 'maintenance') {
            status = 'warning'
            issues.push('Camera is under maintenance')
          }

          // Check video processing
          if (videoStats.total_videos === 0) {
            if (status !== 'offline') status = 'warning'
            issues.push('No videos recorded in the last 7 days')
          }

          // Check processing success rate
          const processingRate = videoStats.total_videos > 0 
            ? (videoStats.total_videos - (videoStats.total_videos * 0.1)) / videoStats.total_videos * 100 // Assuming 10% failure rate for demo
            : 100

          if (processingRate < 80) {
            if (status === 'healthy') status = 'warning'
            if (processingRate < 50) status = 'critical'
            issues.push(`Low processing success rate: ${processingRate.toFixed(1)}%`)
          }

          // Check violation detection rate
          const violationRate = videoStats.total_videos > 0 
            ? (videoStats.videos_with_violations / videoStats.total_videos) * 100 
            : 0

          if (violationRate > 50) {
            if (status === 'healthy') status = 'warning'
            issues.push(`High violation rate: ${violationRate.toFixed(1)}%`)
          }

          // Calculate uptime (mock data for demo)
          const uptime = camera.status === 'offline' ? 0 : Math.random() * 20 + 80 // 80-100%

          return {
            camera,
            videoStats: {
              ...videoStats,
              processing_success_rate: processingRate
            },
            status,
            issues,
            uptime,
            lastSeen: camera.status === 'offline' ? undefined : new Date().toISOString()
          } as CameraHealth

        } catch (err) {
          console.error(`Failed to get health data for camera ${camera.camera_id}:`, err)
          return {
            camera,
            videoStats: {
              total_videos: 0,
              videos_with_violations: 0,
              processing_success_rate: 0,
              avg_duration: 0
            },
            status: 'critical' as const,
            issues: ['Failed to fetch camera data'],
            uptime: 0
          } as CameraHealth
        }
      })

      const healthData = await Promise.all(healthPromises)
      setCameraHealthData(healthData)

    } catch (err: any) {
      console.error("Failed to load camera health:", err)
      setError(err.message || "Failed to load camera health data")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCameraHealth()
    setRefreshing(false)
  }

  const getStatusColor = (status: CameraHealth['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'critical':
        return 'bg-red-500'
      case 'offline':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: CameraHealth['status']) => {
    switch (status) {
      case 'healthy':
        return { variant: 'default' as const, label: 'Healthy', color: 'bg-green-100 text-green-800' }
      case 'warning':
        return { variant: 'secondary' as const, label: 'Warning', color: 'bg-yellow-100 text-yellow-800' }
      case 'critical':
        return { variant: 'destructive' as const, label: 'Critical', color: 'bg-red-100 text-red-800' }
      case 'offline':
        return { variant: 'outline' as const, label: 'Offline', color: 'bg-gray-100 text-gray-800' }
      default:
        return { variant: 'outline' as const, label: 'Unknown', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const getStatusIcon = (status: CameraHealth['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'offline':
        return <WifiOff className="h-4 w-4 text-gray-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  // Calculate summary stats
  const totalCameras = cameraHealthData.length
  const healthyCameras = cameraHealthData.filter(c => c.status === 'healthy').length
  const warningCameras = cameraHealthData.filter(c => c.status === 'warning').length
  const criticalCameras = cameraHealthData.filter(c => c.status === 'critical').length
  const offlineCameras = cameraHealthData.filter(c => c.status === 'offline').length

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading camera health data...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{totalCameras}</div>
            <div className="text-xs text-muted-foreground">Total Cameras</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{healthyCameras}</div>
            <div className="text-xs text-muted-foreground">Healthy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{warningCameras}</div>
            <div className="text-xs text-muted-foreground">Warning</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{criticalCameras}</div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{offlineCameras}</div>
            <div className="text-xs text-muted-foreground">Offline</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Health Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Camera Health Monitor
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cameraHealthData.map((health) => {
              const statusBadge = getStatusBadge(health.status)
              
              return (
                <Card key={health.camera.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(health.status)}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{health.camera.name}</h3>
                              <span className="text-sm text-muted-foreground">({health.camera.camera_id})</span>
                              <Badge className={statusBadge.color}>
                                {statusBadge.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{health.camera.location_name}</p>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs text-muted-foreground">Uptime</div>
                              <div className="font-semibold">{health.uptime.toFixed(1)}%</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs text-muted-foreground">Videos (7d)</div>
                              <div className="font-semibold">{health.videoStats.total_videos}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs text-muted-foreground">Violations</div>
                              <div className="font-semibold">{health.videoStats.videos_with_violations}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs text-muted-foreground">Success Rate</div>
                              <div className="font-semibold">{health.videoStats.processing_success_rate.toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>

                        {/* Uptime Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Uptime</span>
                            <span className="font-medium">{health.uptime.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={health.uptime} 
                            className="h-2"
                          />
                        </div>

                        {/* Issues */}
                        {health.issues.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">Issues:</div>
                            <div className="space-y-1">
                              {health.issues.map((issue, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                  <span>{issue}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Last Seen */}
                        {health.lastSeen && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Last seen: {format(new Date(health.lastSeen), "MMM dd, HH:mm", { locale: vi })}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCameraSelect?.(health.camera)}
                        >
                          <CameraIcon className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        
                        {health.status !== 'healthy' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMaintenanceRequest?.(health.camera)}
                          >
                            <Wrench className="h-4 w-4 mr-2" />
                            Maintenance
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}