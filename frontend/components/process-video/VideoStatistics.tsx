"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useVideoStats } from "@/hooks/useVideoStats"
import { 
  Video, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Calendar,
  Loader2
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface VideoStatisticsProps {
  cameraId: number
  cameraName?: string
  dateFrom?: string
  dateTo?: string
}

export function VideoStatistics({ cameraId, cameraName, dateFrom, dateTo }: VideoStatisticsProps) {
  const { stats, loading, error } = useVideoStats({
    cameraId,
    date_from: dateFrom,
    date_to: dateTo
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Đang tải thống kê...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  // Format duration from seconds to readable format
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  // Prepare chart data
  const chartData = stats.by_date.map(item => ({
    date: format(new Date(item.date), "dd/MM", { locale: vi }),
    fullDate: format(new Date(item.date), "dd/MM/yyyy", { locale: vi }),
    videos: item.video_count,
    violations: item.violation_count,
    duration: Math.round(item.total_duration / 60) // Convert to minutes
  }))

  // Calculate processing status summary
  const processingRate = stats.total_videos > 0 
    ? Math.round((stats.videos_with_violations / stats.total_videos) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tổng quan thống kê {cameraName && `- ${cameraName}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Videos */}
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Video className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng số video</p>
                <p className="text-2xl font-bold">{stats.total_videos}</p>
              </div>
            </div>

            {/* Total Duration */}
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng thời lượng</p>
                <p className="text-2xl font-bold">{formatDuration(stats.total_duration)}</p>
                <p className="text-xs text-muted-foreground">
                  TB: {formatDuration(Math.round(stats.avg_duration))}
                </p>
              </div>
            </div>

            {/* Total Violations */}
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng vi phạm</p>
                <p className="text-2xl font-bold">{stats.total_violations}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.videos_with_violations} video có vi phạm
                </p>
              </div>
            </div>

            {/* Processing Status */}
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ phát hiện</p>
                <p className="text-2xl font-bold">{processingRate}%</p>
                <Badge variant={processingRate > 50 ? "destructive" : "secondary"}>
                  {processingRate > 50 ? "Cao" : "Thấp"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Videos per Day Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Video theo ngày
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(label) => {
                      const item = chartData.find(d => d.date === label)
                      return item?.fullDate || label
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "videos") return [value, "Video"]
                      if (name === "duration") return [value, "Phút"]
                      return [value, name]
                    }}
                  />
                  <Legend 
                    formatter={(value) => {
                      if (value === "videos") return "Số video"
                      if (value === "duration") return "Thời lượng (phút)"
                      return value
                    }}
                  />
                  <Bar dataKey="videos" fill="#3b82f6" name="videos" />
                  <Bar dataKey="duration" fill="#10b981" name="duration" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Violations per Day Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4" />
                Vi phạm theo ngày
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(label) => {
                      const item = chartData.find(d => d.date === label)
                      return item?.fullDate || label
                    }}
                    formatter={(value: number) => [value, "Vi phạm"]}
                  />
                  <Legend 
                    formatter={() => "Số vi phạm"}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="violations" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Processing Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-4 w-4" />
            Tóm tắt trạng thái xử lý
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Video đã xử lý</span>
              <div className="flex items-center gap-2">
                <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${stats.total_videos > 0 ? 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{stats.total_videos}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Video có vi phạm</span>
              <div className="flex items-center gap-2">
                <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500"
                    style={{ 
                      width: `${stats.total_videos > 0 ? (stats.videos_with_violations / stats.total_videos) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium">{stats.videos_with_violations}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Video không vi phạm</span>
              <div className="flex items-center gap-2">
                <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ 
                      width: `${stats.total_videos > 0 ? ((stats.total_videos - stats.videos_with_violations) / stats.total_videos) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {stats.total_videos - stats.videos_with_violations}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
