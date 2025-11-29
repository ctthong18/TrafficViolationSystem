"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Video } from "lucide-react"
import { Violation } from "../../hooks/useViolations"
import ViolationDialog from "./ViolationDialog"
import { useState } from "react"
import { VideoPlayerDialog } from "../process-video/VideoPlayerDialog"

interface Props {
  violation: Violation
  onProcess: (id: string, action: string, note: string) => void
}

export default function ViolationCard({ violation, onProcess }: Props) {
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  
  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null
    return (
      <Badge
        variant={
          priority === "high"
            ? "destructive"
            : priority === "medium"
              ? "default"
              : "secondary"
        }
      >
        {priority === "high"
          ? "Ưu tiên cao"
          : priority === "medium"
            ? "Ưu tiên trung bình"
            : "Ưu tiên thấp"}
      </Badge>
    )
  }

  return (
    <Card key={violation.id}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">Vi phạm #{violation.id}</span>
              {getPriorityBadge(violation.priority)}
            </div>
            <p className="text-sm font-medium">{violation.type}</p>
            <p className="text-sm text-muted-foreground">
              Biển số: {violation.license_plate} • {violation.location || 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">
              {violation.date} {violation.time}
            </p>
            {violation.fine && (
              <p className="text-sm font-semibold text-yellow-600 mt-1">
                Phạt: {violation.fine.toLocaleString('vi-VN')} VNĐ
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {violation.video_evidence && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowVideoDialog(true)}
              >
                <Video className="h-4 w-4 mr-1" />
                Video
              </Button>
            )}
            
            {(violation.status === "pending" || violation.status === "reviewing") && (
              <ViolationDialog violation={violation} onProcess={onProcess} />
            )}

            {violation.status === "verified" && (
              <Button variant="outline" size="sm" disabled>
                <Edit className="h-4 w-4 mr-1" />
                Đã xác nhận
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      
      {violation.video_evidence && (
        <VideoPlayerDialog
          open={showVideoDialog}
          onOpenChange={setShowVideoDialog}
          videoUrl={violation.video_evidence.cloudinary_url}
          videoId={violation.video_evidence.video_id}
          title={`Video bằng chứng - Vi phạm #${violation.id}`}
        />
      )}
    </Card>
  )
}
