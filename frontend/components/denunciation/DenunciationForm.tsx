"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useDenunciations } from "@/hooks/useDenuciation"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Shield, AlertTriangle, Lock } from "lucide-react"

interface DenunciationFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function DenunciationForm({ onSuccess, onCancel }: DenunciationFormProps) {
  const { createDenunciation } = useDenunciations()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "other_illegal",
    anonymous: true,
    location: "",
    accusedName: "",
    accusedPosition: "",
    accusedDepartment: "",
  })

  const denunciationTypes = [
    { value: "corruption", label: "Tham nhũng" },
    { value: "abuse_of_power", label: "Lạm dụng quyền lực" },
    { value: "violation_cover_up", label: "Che giấu vi phạm" },
    { value: "fraud", label: "Gian lận" },
    { value: "system_manipulation", label: "Thao túng hệ thống" },
    { value: "other_illegal", label: "Hành vi bất hợp pháp khác" },
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
      // Map form data to API format
      const payload = {
        title: formData.title,
        type: formData.type,
        description: formData.description,
        location: formData.location || "Không xác định",
        anonymous: formData.anonymous,
      }
      
      await createDenunciation(payload)
      toast({
        title: "Thành công",
        description: "Đã gửi tố cáo. Thông tin của bạn sẽ được bảo mật tuyệt đối.",
      })
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "other_illegal",
        anonymous: true,
        location: "",
        accusedName: "",
        accusedPosition: "",
        accusedDepartment: "",
      })
      
      onSuccess?.()
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể gửi tố cáo",
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
          <Shield className="h-5 w-5" />
          Tố cáo hành vi vi phạm
        </CardTitle>
        <CardDescription>
          Thông tin của bạn sẽ được bảo mật tuyệt đối. Chúng tôi cam kết bảo vệ người tố cáo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cảnh báo bảo mật */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Cam kết bảo mật:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Thông tin cá nhân được mã hóa và bảo vệ</li>
                  <li>Chỉ cơ quan có thẩm quyền mới được tiếp cận</li>
                  <li>Người tố cáo được bảo vệ theo luật định</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Loại tố cáo *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại tố cáo" />
              </SelectTrigger>
              <SelectContent>
                {denunciationTypes.map((type) => (
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
              placeholder="Nhập tiêu đề tố cáo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết về hành vi vi phạm, thời gian, địa điểm, người liên quan..."
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Vui lòng cung cấp càng nhiều thông tin càng tốt để chúng tôi có thể điều tra hiệu quả
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Địa điểm (tùy chọn)</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Nơi xảy ra hành vi vi phạm"
            />
          </div>

          <div className="space-y-2">
            <Label>Thông tin người bị tố cáo (tùy chọn)</Label>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Họ tên"
                value={formData.accusedName}
                onChange={(e) => setFormData({ ...formData, accusedName: e.target.value })}
              />
              <Input
                placeholder="Chức vụ"
                value={formData.accusedPosition}
                onChange={(e) => setFormData({ ...formData, accusedPosition: e.target.value })}
              />
            </div>
            <Input
              placeholder="Đơn vị/Phòng ban"
              value={formData.accusedDepartment}
              onChange={(e) => setFormData({ ...formData, accusedDepartment: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.anonymous}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, anonymous: checked as boolean })
              }
            />
            <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
              Tố cáo ẩn danh (khuyến nghị)
            </Label>
          </div>

          {!formData.anonymous && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Lưu ý:</p>
                  <p>
                    Nếu không chọn ẩn danh, thông tin cá nhân của bạn sẽ được lưu lại để liên hệ khi cần thiết.
                    Tuy nhiên, thông tin này vẫn được bảo mật và chỉ cơ quan điều tra mới được tiếp cận.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Cảnh báo:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Tố cáo sai sự thật có thể bị xử lý theo pháp luật</li>
                  <li>Chỉ tố cáo khi có căn cứ và bằng chứng rõ ràng</li>
                  <li>Không lợi dụng tố cáo để vu khống, trả thù cá nhân</li>
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
                  <Shield className="h-4 w-4 mr-2" />
                  Gửi tố cáo
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
