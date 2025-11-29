"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, Clock, CheckCircle, XCircle, AlertCircle, 
  User, Calendar, Star, MessageSquare 
} from "lucide-react"
import { Complaint, useComplaints } from "@/hooks/useComplaints"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

interface ComplaintDetailProps {
  complaint: Complaint
  onClose?: () => void
}

export function ComplaintDetail({ complaint, onClose }: ComplaintDetailProps) {
  const { rateComplaint } = useComplaints()
  const { toast } = useToast()
  const [rating, setRating] = useState(complaint.user_rating || 0)
  const [feedback, setFeedback] = useState(complaint.user_feedback || "")
  const [submittingRating, setSubmittingRating] = useState(false)

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { label: "Chờ xử lý", variant: "secondary", icon: Clock },
      under_review: { label: "Đang xem xét", variant: "default", icon: AlertCircle },
      resolved: { label: "Đã giải quyết", variant: "outline", icon: CheckCircle },
      rejected: { label: "Từ chối", variant: "destructive", icon: XCircle },
      cancelled: { label: "Đã hủy", variant: "outline", icon: XCircle },
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getComplaintTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      violation_dispute: "Khiếu nại vi phạm",
      false_positive: "Báo cáo sai",
      missing_violation: "Vi phạm bị bỏ sót",
      officer_behavior: "Hành vi cán bộ",
      system_error: "Lỗi hệ thống",
      other: "Khác",
    }
    return typeLabels[type] || type
  }

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn số sao đánh giá",
        variant: "destructive",
      })
      return
    }

    setSubmittingRating(true)
    try {
      await rateComplaint(complaint.id, rating, feedback)
      toast({
        title: "Thành công",
        description: "Đã gửi đánh giá của bạn",
      })
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể gửi đánh giá",
        variant: "destructive",
      })
    } finally {
      setSubmittingRating(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-xl">{complaint.title}</CardTitle>
                {getStatusBadge(complaint.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {complaint.complaint_code}
                </span>
                <span>•</span>
                <span>{getComplaintTypeLabel(complaint.complaint_type)}</span>
              </div>
            </div>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Đóng
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Thông tin cơ bản */}
          <div>
            <h3 className="font-semibold mb-2">Mô tả chi tiết</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          <Separator />

          {/* Thông tin thời gian */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span>Ngày tạo</span>
              </div>
              <p className="text-sm font-medium">
                {format(new Date(complaint.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
              </p>
            </div>
            {complaint.resolved_at && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Ngày giải quyết</span>
                </div>
                <p className="text-sm font-medium">
                  {format(new Date(complaint.resolved_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                </p>
              </div>
            )}
          </div>

          {/* Thông tin người khiếu nại */}
          {!complaint.complainant_name && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Khiếu nại ẩn danh
              </p>
            </div>
          )}

          {complaint.complainant_name && (
            <div>
              <h3 className="font-semibold mb-2">Thông tin người khiếu nại</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Họ tên:</span>
                  <p className="font-medium">{complaint.complainant_name}</p>
                </div>
                {complaint.complainant_phone && (
                  <div>
                    <span className="text-muted-foreground">Số điện thoại:</span>
                    <p className="font-medium">{complaint.complainant_phone}</p>
                  </div>
                )}
                {complaint.complainant_email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{complaint.complainant_email}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Thông tin liên quan */}
          {(complaint.violation_id || complaint.vehicle_id) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Thông tin liên quan</h3>
                <div className="space-y-2 text-sm">
                  {complaint.violation_id && (
                    <p>
                      <span className="text-muted-foreground">Vi phạm:</span>{" "}
                      <span className="font-medium">#{complaint.violation_id}</span>
                    </p>
                  )}
                  {complaint.vehicle_id && (
                    <p>
                      <span className="text-muted-foreground">Phương tiện:</span>{" "}
                      <span className="font-medium">#{complaint.vehicle_id}</span>
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Kết quả xử lý */}
          {complaint.status === "resolved" && (
            <>
              <Separator />
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">Đã giải quyết</h3>
                    <p className="text-sm text-green-800 whitespace-pre-wrap">
                      {complaint.resolution || "Khiếu nại đã được xử lý"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {complaint.status === "rejected" && (
            <>
              <Separator />
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">Từ chối</h3>
                    <p className="text-sm text-red-800 whitespace-pre-wrap">
                      {complaint.resolution || "Khiếu nại không được chấp nhận"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Đánh giá (chỉ hiển thị khi đã giải quyết) */}
      {complaint.status === "resolved" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Đánh giá
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {complaint.user_rating ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= complaint.user_rating!
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                {complaint.user_feedback && (
                  <div className="mt-4">
                    <Label>Nhận xét của bạn</Label>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                      {complaint.user_feedback}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Label>Đánh giá chất lượng giải quyết</Label>
                <div className="flex items-center gap-2 my-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 hover:text-yellow-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="feedback">Nhận xét (tùy chọn)</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSubmitRating}
                  disabled={submittingRating || rating === 0}
                  className="mt-4"
                >
                  {submittingRating ? (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Gửi đánh giá
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
