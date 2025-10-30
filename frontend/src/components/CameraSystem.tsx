"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Camera, MapPin, Wifi, WifiOff, Settings, Search } from "lucide-react"

export default function CameraSystem() {
  const [searchTerm, setSearchTerm] = useState("")

  const cameras = [
    {
      id: "CAM-001",
      name: "Ngã tư Láng Hạ",
      location: "Láng Hạ - Thái Hà",
      status: "online",
      lastUpdate: "2 phút trước",
      violations: 15,
    },
    {
      id: "CAM-002",
      name: "Đại lộ Thăng Long",
      location: "Km 5 Đại lộ Thăng Long",
      status: "online",
      lastUpdate: "1 phút trước",
      violations: 8,
    },
    {
      id: "CAM-003",
      name: "Cầu Nhật Tân",
      location: "Đầu cầu Nhật Tân",
      status: "offline",
      lastUpdate: "15 phút trước",
      violations: 0,
    },
  ]

  const filteredCameras = cameras.filter(
    (camera) =>
      camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camera.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hệ thống camera giám sát</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm camera theo tên hoặc mã..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Tất cả ({filteredCameras.length})</TabsTrigger>
              <TabsTrigger value="online">
                Hoạt động ({filteredCameras.filter((c) => c.status === "online").length})
              </TabsTrigger>
              <TabsTrigger value="offline">
                Offline ({filteredCameras.filter((c) => c.status === "offline").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCameras.map((camera) => (
                  <Card key={camera.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          <span className="font-medium">{camera.id}</span>
                        </div>
                        <Badge variant={camera.status === "online" ? "default" : "destructive"}>
                          {camera.status === "online" ? (
                            <div className="flex items-center gap-1">
                              <Wifi className="h-3 w-3" />
                              Online
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <WifiOff className="h-3 w-3" />
                              Offline
                            </div>
                          )}
                        </Badge>
                      </div>
                      <h4 className="font-medium mb-2">{camera.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        {camera.location}
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">Cập nhật: {camera.lastUpdate}</div>
                      <div className="text-sm mb-3">
                        Vi phạm hôm nay: <span className="font-medium">{camera.violations}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          Xem live
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="online" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCameras
                  .filter((camera) => camera.status === "online")
                  .map((camera) => (
                    <Card key={camera.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            <span className="font-medium">{camera.id}</span>
                          </div>
                          <Badge variant="default">
                            <div className="flex items-center gap-1">
                              <Wifi className="h-3 w-3" />
                              Online
                            </div>
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-2">{camera.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          {camera.location}
                        </div>
                        <div className="text-xs text-muted-foreground mb-3">Cập nhật: {camera.lastUpdate}</div>
                        <div className="text-sm mb-3">
                          Vi phạm hôm nay: <span className="font-medium">{camera.violations}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            Xem live
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="offline" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCameras
                  .filter((camera) => camera.status === "offline")
                  .map((camera) => (
                    <Card key={camera.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            <span className="font-medium">{camera.id}</span>
                          </div>
                          <Badge variant="destructive">
                            <div className="flex items-center gap-1">
                              <WifiOff className="h-3 w-3" />
                              Offline
                            </div>
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-2">{camera.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          {camera.location}
                        </div>
                        <div className="text-xs text-muted-foreground mb-3">Cập nhật: {camera.lastUpdate}</div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            Khởi động lại
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
