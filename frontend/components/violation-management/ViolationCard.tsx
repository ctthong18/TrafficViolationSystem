"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, User, AlertTriangle, Video } from "lucide-react"
import type { Violation } from "../../hooks/useViolations"
import { useState } from "react"
import { VideoPlayerDialog } from "../process-video/VideoPlayerDialog"

export function ViolationCard({ data }: { data: Violation }) {
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return <Badge className="bg-green-500 text-white">Đã xử lý</Badge>
      case "verified":
        return <Badge className="bg-blue-500 text-white">Đã xác nhận</Badge>
      case "pending":
        return <Badge variant="secondary">Chờ xử lý</Badge>
      case "reviewing":
        return <Badge className="bg-yellow-500 text-white">Đang xem xét</Badge>
      case "paid":
        return <Badge className="bg-green-600 text-white">Đã thanh toán</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Vi phạm #{data.id}
          </CardTitle>
          {getStatusBadge(data.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Loại vi phạm:</p>
            <p className="font-medium">{data.type}</p>
            <p className="text-sm text-muted-foreground mt-2">Địa điểm:</p>
            <p className="font-medium">{data.location || 'N/A'}</p>
            {data.description && (
              <>
                <p className="text-sm text-muted-foreground mt-2">Mô tả:</p>
                <p className="text-sm">{data.description}</p>
              </>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Biển số:</p>
            <p className="font-medium">{data.license_plate}</p>
            <p className="text-sm text-muted-foreground mt-2">Thời gian:</p>
            <p className="font-medium">{data.date} {data.time}</p>
            {data.fine && (
              <>
                <p className="text-sm text-muted-foreground mt-2">Mức phạt:</p>
                <p className="font-medium text-yellow-600">{data.fine.toLocaleString('vi-VN')} VNĐ</p>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {data.video_evidence && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowVideoDialog(true)}
            >
              <Video className="h-4 w-4 mr-2" /> Xem video
            </Button>
          )}
          {data.evidence && (
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" /> Xem bằng chứng
            </Button>
          )}
          {data.status === "pending" && (
            <Button size="sm">
              <User className="h-4 w-4 mr-2" /> Phân công xử lý
            </Button>
          )}
        </div>
      </CardContent>
      
      {data.video_evidence && (
        <VideoPlayerDialog
          open={showVideoDialog}
          onOpenChange={setShowVideoDialog}
          videoUrl={data.video_evidence.cloudinary_url}
          videoId={data.video_evidence.video_id}
          title={`Video bằng chứng - Vi phạm #${data.id}`}
        />
      )}
    </Card>
  )
}
