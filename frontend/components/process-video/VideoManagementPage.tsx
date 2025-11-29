"use client"

import { useState } from "react"
import { VideoLibrary } from "./VideoLibrary"
import { VideoUpload } from "../process-video/VideoUpload"
import { VideoStatistics } from "../process-video/VideoStatistics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCameras } from "@/hooks/useCameras"
import { Video, BarChart3, Upload, Library } from "lucide-react"

export function VideoManagementPage() {
  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null)
  const { cameras, loading, error } = useCameras({ limit: 100 })

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Đang tải danh sách camera...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const selectedCamera = cameras.find((c) => c.id === selectedCameraId)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6" />
            Quản lý Video Camera
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Chọn Camera</label>
              <Select
                value={selectedCameraId?.toString() || ""}
                onValueChange={(value) => setSelectedCameraId(parseInt(value))}
              >
                <SelectTrigger className="w-full sm:w-96">
                  <SelectValue placeholder="Chọn camera để xem video" />
                </SelectTrigger>
                <SelectContent>
                  {cameras.map((camera) => (
                    <SelectItem key={camera.id} value={camera.id.toString()}>
                      {camera.name} - {camera.location_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCameraId && (
        <Tabs defaultValue="statistics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Thống kê
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Library className="h-4 w-4" />
              Thư viện
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Tải lên
            </TabsTrigger>
          </TabsList>

          <TabsContent value="statistics" className="space-y-6">
            <VideoStatistics
              cameraId={selectedCameraId}
              cameraName={selectedCamera?.name}
            />
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <VideoLibrary
              cameraId={selectedCameraId}
              cameraName={selectedCamera?.name}
            />
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <VideoUpload
              preselectedCameraId={selectedCameraId}
              onUploadComplete={() => {
                // Refresh video library after upload
                window.location.reload()
              }}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
