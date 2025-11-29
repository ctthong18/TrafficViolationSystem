"use client"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, Video, MessageSquare, CreditCard } from "lucide-react"
import { Violation } from "@/hooks/useViolations"
import { useState } from "react"
import { VideoPlayerDialog } from "@/components/process-video/VideoPlayerDialog"
import { ComplaintForm } from "@/components/complaint/ComplaintForm"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface Props {
  violations: Violation[]
}

export function ViolationHistory({ violations }: Props) {
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

  if (!violations || violations.length === 0) {
    return (
      <div className="rounded-lg border p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Không có lịch sử vi phạm</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {violations.map((violation) => (
          <Card key={violation.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Vi phạm #{violation.id}</span>
                    {getStatusBadge(violation.status)}
                  </div>
                  <p className="text-sm font-medium">{violation.type}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Biển số: {violation.license_plate}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {violation.location} • {violation.date} {violation.time}
                  </p>
                  {violation.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {violation.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {violation.fine && (
                    <p className={`text-lg font-bold ${
                      violation.status === "paid" 
                        ? "text-green-600" 
                        : "text-yellow-600"
                    }`}>
                      {typeof violation.fine === 'number' 
                        ? violation.fine.toLocaleString('vi-VN') 
                        : violation.fine} VNĐ
                    </p>
                  )}
                  <div className="flex gap-2 mt-3 justify-end">
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
                    {(violation.status === "unpaid" || violation.status === "verified") && (
                      <Button 
                        size="sm"
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Thanh toán
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Video Dialog */}
      {selectedVideoViolation?.video_evidence && (
        <VideoPlayerDialog
          open={!!selectedVideoViolation}
          onOpenChange={(open) => !open && setSelectedVideoViolation(null)}
          videoUrl={selectedVideoViolation.video_evidence.cloudinary_url}
          videoId={selectedVideoViolation.video_evidence.video_id}
          title={`Video bằng chứng - Vi phạm #${selectedVideoViolation.id}`}
        />
      )}

      {/* Complaint Dialog */}
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
    </>
  )
}
