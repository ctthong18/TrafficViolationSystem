"use client"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Video, MessageSquare } from "lucide-react"
import { Violation } from "@/hooks/useViolations"
import { useState } from "react"
import { VideoPlayerDialog } from "../process-video/VideoPlayerDialog"
import { ComplaintForm } from "@/components/complaint/ComplaintForm"

interface Props {
  violations: Violation[]
}

export function ViolationList({ violations }: Props) {
  const [selectedVideoViolation, setSelectedVideoViolation] = useState<Violation | null>(null)
  const [complaintViolation, setComplaintViolation] = useState<Violation | null>(null)
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500 text-white">Đã thanh toán</Badge>
      case "unpaid":
        return <Badge className="bg-yellow-500 text-white">Chưa thanh toán</Badge>
      case "verified":
      case "approved":
        return <Badge className="bg-orange-500 text-white">Đã xác nhận</Badge>
      case "pending":
        return <Badge className="bg-blue-500 text-white">Chờ xử lý</Badge>
      case "reviewing":
        return <Badge className="bg-purple-500 text-white">Đang xem xét</Badge>
      case "rejected":
        return <Badge className="bg-red-500 text-white">Từ chối</Badge>
      case "processing":
        return <Badge className="bg-cyan-500 text-white">Đang xử lý</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Vi phạm gần đây</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {violations.map((violation) => (
            <div
              key={violation.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{violation.id}</span>
                  {getStatusBadge(violation.status)}
                </div>
                <p className="text-sm text-muted-foreground">{violation.type}</p>
                <p className="text-xs text-muted-foreground">
                  {violation.location} • {violation.time}
                </p>
                <p className="text-xs text-muted-foreground">Biển số: {violation.license_plate}</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    violation.status === "unpaid" ? "text-destructive" : "text-success"
                  }`}
                >
                  {violation.fine}
                </p>
                <div className="flex gap-2 mt-2">
                  {violation.video_evidence && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedVideoViolation(violation)}
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Video
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setComplaintViolation(violation)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Khiếu nại
                  </Button>
                  {violation.status === "unpaid" && (
                    <Button size="sm">
                      Thanh toán
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      {selectedVideoViolation?.video_evidence && (
        <VideoPlayerDialog
          open={!!selectedVideoViolation}
          onOpenChange={(open) => !open && setSelectedVideoViolation(null)}
          videoUrl={selectedVideoViolation.video_evidence.cloudinary_url}
          videoId={selectedVideoViolation.video_evidence.video_id}
          title={`Video bằng chứng - Vi phạm #${selectedVideoViolation.id}`}
        />
      )}
      
      {/* Dialog khiếu nại */}
      <Dialog open={!!complaintViolation} onOpenChange={(open) => !open && setComplaintViolation(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Khiếu nại vi phạm #{complaintViolation?.id}</DialogTitle>
          </DialogHeader>
          {complaintViolation && (
            <ComplaintForm
              violationId={parseInt(complaintViolation.id)}
              onSuccess={() => setComplaintViolation(null)}
              onCancel={() => setComplaintViolation(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
