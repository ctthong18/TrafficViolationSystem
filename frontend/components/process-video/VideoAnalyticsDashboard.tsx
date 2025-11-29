"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, TrendingUp, Video, CheckCircle, XCircle, Camera } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface VideoAnalytics {
  summary: {
    total_videos: number
    completed_videos: number
    failed_videos: number
    pending_videos: number
    processing_success_rate: number
    total_detections: number
    detection_accuracy_rate: number
    date_range: {
      from: string
      to: string
    }
  }
  videos_per_period: Array<{
    date: string
    total_videos: number
    processed: number
    failed: number
    pending: number
  }>
  detection_accuracy: {
    total_reviewed: number
    approved: number
    rejected: number
    accuracy_rate: number
    pending_review: number
  }
  top_violation_types: Array<{
    violation_type: string
    count: number
    avg_confidence: number
  }>
  camera_performance: Array<{
    camera_id: number
    camera_name: string
    location: string
    total_videos: number
    processed_videos: number
    total_violations: number
    avg_video_duration: number
    processing_rate: number
  }>
}

export function VideoAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [selectedCamera, setSelectedCamera] = useState<string>("all")
  const [cameras, setCameras] = useState<Array<{ id: number; name: string }>>([])

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    setDateFrom(thirtyDaysAgo)
    setDateTo(today)
    
    // Fetch cameras list
    fetchCameras()
  }, [])

  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchAnalytics()
    }
  }, [dateFrom, dateTo, selectedCamera])

  const fetchCameras = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/cameras`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCameras(data.items || [])
      }
    } catch (error) {
      console.error("Failed to fetch cameras:", error)
    }
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      const params = new URLSearchParams()
      
      if (dateFrom) {
        params.append("date_from", format(dateFrom, "yyyy-MM-dd"))
      }
      if (dateTo) {
        params.append("date_to", format(dateTo, "yyyy-MM-dd"))
      }
      if (selectedCamera !== "all") {
        params.append("camera_id", selectedCamera)
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/video-analytics/analytics?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Filters</CardTitle>
          <CardDescription>Select date range and camera to view analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Date From */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Camera Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Camera</label>
              <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                <SelectTrigger>
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cameras</SelectItem>
                  {cameras.map((camera) => (
                    <SelectItem key={camera.id} value={camera.id.toString()}>
                      {camera.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.total_videos}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.processing_success_rate}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.summary.completed_videos}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.pending_videos} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.summary.detection_accuracy_rate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.detection_accuracy.total_reviewed} reviewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Videos</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics.summary.failed_videos}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.total_detections} total detections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Videos Per Period Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Videos Processed Per Period</CardTitle>
          <CardDescription>Daily breakdown of video processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.videos_per_period.slice(-14).map((period) => (
              <div key={period.date} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">{period.date}</div>
                <div className="flex-1">
                  <div className="flex gap-1 h-8">
                    <div
                      className="bg-green-500 rounded flex items-center justify-center text-xs text-white"
                      style={{
                        width: `${(period.processed / period.total_videos) * 100}%`,
                      }}
                      title={`Processed: ${period.processed}`}
                    >
                      {period.processed > 0 && period.processed}
                    </div>
                    <div
                      className="bg-yellow-500 rounded flex items-center justify-center text-xs text-white"
                      style={{
                        width: `${(period.pending / period.total_videos) * 100}%`,
                      }}
                      title={`Pending: ${period.pending}`}
                    >
                      {period.pending > 0 && period.pending}
                    </div>
                    <div
                      className="bg-red-500 rounded flex items-center justify-center text-xs text-white"
                      style={{
                        width: `${(period.failed / period.total_videos) * 100}%`,
                      }}
                      title={`Failed: ${period.failed}`}
                    >
                      {period.failed > 0 && period.failed}
                    </div>
                  </div>
                </div>
                <div className="w-16 text-sm text-right font-medium">
                  {period.total_videos}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Processed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Failed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Accuracy */}
        <Card>
          <CardHeader>
            <CardTitle>Detection Accuracy Rate</CardTitle>
            <CardDescription>AI detection review results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Approved</span>
                <span className="text-sm text-green-600 font-bold">
                  {analytics.detection_accuracy.approved}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (analytics.detection_accuracy.approved /
                        analytics.detection_accuracy.total_reviewed) *
                      100
                    }%`,
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rejected</span>
                <span className="text-sm text-red-600 font-bold">
                  {analytics.detection_accuracy.rejected}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (analytics.detection_accuracy.rejected /
                        analytics.detection_accuracy.total_reviewed) *
                      100
                    }%`,
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Review</span>
                <span className="text-sm text-yellow-600 font-bold">
                  {analytics.detection_accuracy.pending_review}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (analytics.detection_accuracy.pending_review /
                        (analytics.detection_accuracy.total_reviewed +
                          analytics.detection_accuracy.pending_review)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {analytics.detection_accuracy.accuracy_rate}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Accuracy</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Violation Types */}
        <Card>
          <CardHeader>
            <CardTitle>Top Violation Types</CardTitle>
            <CardDescription>Most detected violations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.top_violation_types.slice(0, 5).map((violation, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{violation.violation_type}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold">{violation.count}</div>
                      <div className="text-xs text-gray-500">
                        {(violation.avg_confidence * 100).toFixed(0)}% conf.
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (violation.count /
                            Math.max(...analytics.top_violation_types.map((v) => v.count))) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Camera Performance Metrics</CardTitle>
          <CardDescription>Performance statistics by camera</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Camera</th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-right py-3 px-4">Videos</th>
                  <th className="text-right py-3 px-4">Processed</th>
                  <th className="text-right py-3 px-4">Violations</th>
                  <th className="text-right py-3 px-4">Avg Duration</th>
                  <th className="text-right py-3 px-4">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.camera_performance.map((camera) => (
                  <tr key={camera.camera_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{camera.camera_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{camera.location}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {camera.total_videos}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600">
                      {camera.processed_videos}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600">
                      {camera.total_violations}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {Math.round(camera.avg_video_duration)}s
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={cn(
                          "font-medium",
                          camera.processing_rate >= 90
                            ? "text-green-600"
                            : camera.processing_rate >= 70
                            ? "text-yellow-600"
                            : "text-red-600"
                        )}
                      >
                        {camera.processing_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
