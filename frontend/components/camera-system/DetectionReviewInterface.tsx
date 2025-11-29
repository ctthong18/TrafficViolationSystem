"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AIDetection, detectionApi } from "@/lib/api"
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  AlertCircle,
  Video,
  Clock,
  Car,
  Hash,
  TrendingUp,
  FileText,
  Loader2
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface DetectionReviewInterfaceProps {
  detection: AIDetection
  onReviewComplete?: (success: boolean, violationId?: number) => void
  onCancel?: () => void
}

export function DetectionReviewInterface({
  detection,
  onReviewComplete,
  onCancel
}: DetectionReviewInterfaceProps) {
  const [selectedAction, setSelectedAction] = useState<"approve" | "reject" | "modify" | null>(null)
  const [notes, setNotes] = useState("")
  const [modifiedData] = useState<Record<string, any>>(detection.data)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!selectedAction) {
      setError("Vui lòng chọn hành động (Phê duyệt, Từ chối, hoặc Chỉnh sửa)")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await detectionApi.review(detection.id, {
        action: selectedAction,
        notes: notes || undefined,
        modified_data: selectedAction === "modify" ? modifiedData : undefined
      })

      if (onReviewComplete) {
        onReviewComplete(true, response.violation_id)
      }
    } catch (err: any) {
      console.error("Error reviewing detection:", err)
      setError(err.message || "Không thể xử lý phát hiện")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600"
    if (confidence >= 0.7) return "text-yellow-600"
    return "text-orange-600"
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return { variant: "default" as const, label: "Độ tin cậy cao", color: "bg-green-100 text-green-800" }
    if (confidence >= 0.7) return { variant: "secondary" as const, label: "Độ tin cậy trung bình", color: "bg-yellow-100 text-yellow-800" }
    return { variant: "outline" as const, label: "Độ tin cậy thấp", color: "bg-orange-100 text-orange-800" }
  }

  const confidenceBadge = getConfidenceBadge(detection.confidence)

  // Extract key information from detection data
  const licensePlate = detection.data.license_plate || detection.data.plate_number
  const vehicleType = detection.data.vehicle_type
  const violationType = detection.data.violation_type
  const vehicleColor = detection.data.vehicle_color
  const vehicleBrand = detection.data.vehicle_brand
  const description = detection.data.description || detection.data.violation_description

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Xem xét phát hiện AI
            </span>
            <Badge variant={confidenceBadge.variant} className={confidenceBadge.color}>
              {confidenceBadge.label}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Detection Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="h-4 w-4" />
            Thông tin phát hiện
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Video ID:</span>
              <span className="font-mono">{detection.video_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Timestamp:</span>
              <span className="font-mono">{detection.timestamp.toFixed(1)}s</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detection Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chi tiết phát hiện</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Confidence Score */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Độ tin cậy AI:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getConfidenceColor(detection.confidence)}`}>
                {(detection.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <Separator />

          {/* Detection Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Loại phát hiện</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{detection.detection_type}</Badge>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground">Thời gian phát hiện</Label>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-3 w-3" />
                {format(new Date(detection.detected_at), "dd/MM/yyyy HH:mm:ss", { locale: vi })}
              </div>
            </div>
          </div>

          <Separator />

          {/* License Plate & Vehicle Info */}
          {(licensePlate || vehicleType) && (
            <>
              <div className="space-y-3">
                <Label className="text-base font-semibold">Thông tin phương tiện</Label>
                
                {licensePlate && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Hash className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-xs text-muted-foreground">Biển số xe</div>
                      <div className="text-lg font-bold text-blue-900">{licensePlate}</div>
                    </div>
                  </div>
                )}

                {vehicleType && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Loại xe</div>
                        <div className="font-medium">{vehicleType}</div>
                      </div>
                      {vehicleColor && (
                        <div>
                          <div className="text-xs text-muted-foreground">Màu xe</div>
                          <div className="font-medium">{vehicleColor}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {vehicleBrand && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Hãng xe:</span>
                    <span className="font-medium">{vehicleBrand}</span>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Violation Info */}
          {violationType && (
            <>
              <div className="space-y-3">
                <Label className="text-base font-semibold">Thông tin vi phạm</Label>
                
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Loại vi phạm</div>
                    <div className="font-bold text-red-900">{violationType}</div>
                    {description && (
                      <div className="text-sm text-red-800 mt-1">{description}</div>
                    )}
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* AI Reasoning / Additional Data */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Dữ liệu AI chi tiết</Label>
            <div className="bg-muted p-3 rounded-lg max-h-48 overflow-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(detection.data, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hành động xem xét</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={selectedAction === "approve" ? "default" : "outline"}
              className={`h-auto py-4 flex-col gap-2 ${
                selectedAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""
              }`}
              onClick={() => setSelectedAction("approve")}
            >
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Phê duyệt</span>
              <span className="text-xs opacity-80">Tạo vi phạm</span>
            </Button>

            <Button
              variant={selectedAction === "reject" ? "destructive" : "outline"}
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setSelectedAction("reject")}
            >
              <XCircle className="h-6 w-6" />
              <span className="font-semibold">Từ chối</span>
              <span className="text-xs opacity-80">Không hợp lệ</span>
            </Button>

            <Button
              variant={selectedAction === "modify" ? "default" : "outline"}
              className={`h-auto py-4 flex-col gap-2 ${
                selectedAction === "modify" ? "bg-blue-600 hover:bg-blue-700" : ""
              }`}
              onClick={() => setSelectedAction("modify")}
            >
              <Edit3 className="h-6 w-6" />
              <span className="font-semibold">Chỉnh sửa</span>
              <span className="text-xs opacity-80">Sửa thông tin</span>
            </Button>
          </div>

          {/* Action Description */}
          {selectedAction && (
            <Alert>
              <AlertDescription>
                {selectedAction === "approve" && (
                  <span>
                    <strong>Phê duyệt:</strong> Xác nhận phát hiện này là chính xác. Hệ thống sẽ tự động tạo hồ sơ vi phạm.
                  </span>
                )}
                {selectedAction === "reject" && (
                  <span>
                    <strong>Từ chối:</strong> Phát hiện này không chính xác hoặc không hợp lệ. Sẽ không tạo vi phạm.
                  </span>
                )}
                {selectedAction === "modify" && (
                  <span>
                    <strong>Chỉnh sửa:</strong> Cập nhật thông tin phát hiện trước khi xem xét lại.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="review-notes">
              Ghi chú của cán bộ {selectedAction ? "" : "(Tùy chọn)"}
            </Label>
            <Textarea
              id="review-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú về quyết định của bạn, lý do phê duyệt/từ chối, hoặc thông tin bổ sung..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Ghi chú này sẽ được lưu vào lịch sử xem xét và có thể được sử dụng làm bằng chứng.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!selectedAction || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận quyết định"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
