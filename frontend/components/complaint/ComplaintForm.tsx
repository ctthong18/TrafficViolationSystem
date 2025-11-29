"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useComplaints, ComplaintCreate } from "@/hooks/useComplaints"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FileText, AlertCircle } from "lucide-react"

interface ComplaintFormProps {
  violationId?: number
  vehicleId?: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function ComplaintForm({ violationId, vehicleId, onSuccess, onCancel }: ComplaintFormProps) {
  const { createComplaint } = useComplaints()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState<ComplaintCreate>({
    title: "",
    description: "",
    complaint_type: "other",
    desired_resolution: "",
    is_anonymous: false,
    violation_id: violationId,
    vehicle_id: vehicleId,
    evidence_urls: [],
  })

  const complaintTypes = [
    { value: "violation_dispute", label: "Khiếu nại vi phạm" },
    { value: "false_positive", label: "Báo cáo sai" },
    { value: "missing_violation", label: "Vi phạm bị bỏ sót" },
    { value: "officer_behavior", label: "Hành vi cán bộ" },
    { value: "system_error", label: "Lỗi hệ thống" },
    { value: "other", label: "Khác" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await createComplaint(formData)
      toast({
        title: "Thành công",
        description: "Đã tạo khiếu nại mới",
      })
      onSuccess?.()
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể tạo khiếu nại",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Tạo khiếu nại mới
        </CardTitle>
        <CardDescription>
          Vui lòng cung cấp thông tin chi tiết về khiếu nại của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="complaint_type">Loại khiếu nại *</Label>
            <Select
              value={formData.complaint_type}
              onValueChange={(value) => setFormData({ ...formData, complaint_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại khiếu nại" />
              </SelectTrigger>
              <SelectContent>
                {complaintTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nhập tiêu đề khiếu nại"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết về khiếu nại của bạn..."
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desired_resolution">Giải pháp mong muốn</Label>
            <Textarea
              id="desired_resolution"
              value={formData.desired_resolution}
              onChange={(e) => setFormData({ ...formData, desired_resolution: e.target.value })}
              placeholder="Bạn mong muốn vấn đề được giải quyết như thế nào?"
              rows={3}
            />
          </div>

          {violationId && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Khiếu nại liên quan đến vi phạm #{violationId}
              </p>
            </div>
          )}

          {vehicleId && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Khiếu nại liên quan đến phương tiện #{vehicleId}
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_anonymous"
              checked={formData.is_anonymous}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, is_anonymous: checked as boolean })
              }
            />
            <Label htmlFor="is_anonymous" className="text-sm font-normal cursor-pointer">
              Gửi khiếu nại ẩn danh
            </Label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Khiếu nại sẽ được xem xét trong vòng 3-5 ngày làm việc</li>
                  <li>Bạn sẽ nhận được thông báo khi có cập nhật</li>
                  <li>Khiếu nại ẩn danh sẽ không hiển thị thông tin cá nhân</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Hủy
              </Button>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Gửi khiếu nại
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
