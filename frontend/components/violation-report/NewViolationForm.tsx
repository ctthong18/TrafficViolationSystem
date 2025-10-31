"use client"

import { useState } from "react"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Upload, Send } from "lucide-react"
import { violationsApi } from "@/lib/api"

interface Props {
  onSubmitSuccess?: () => void
}

export function NewViolationForm({ onSubmitSuccess }: Props) {
  const [form, setForm] = useState({
    type: "",
    location: "",
    time: "",
    date: "",
    licensePlate: "",
    description: "",
    evidence: null as File | null,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value as any)
      })

      await violationsApi.createReport(formData)
      alert("Báo cáo đã được gửi thành công!")

      setForm({
        type: "",
        location: "",
        time: "",
        date: "",
        licensePlate: "",
        description: "",
        evidence: null,
      })

      onSubmitSuccess?.()
    } catch (err) {
      alert("Gửi báo cáo thất bại. Vui lòng thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Báo cáo vi phạm giao thông</CardTitle>
        <p className="text-sm text-muted-foreground">
          Vui lòng cung cấp thông tin chi tiết và bằng chứng rõ ràng để hỗ trợ quá trình xử lý
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- Loại vi phạm + Biển số --- */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Loại vi phạm *</Label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại vi phạm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="red-light">Vượt đèn đỏ</SelectItem>
                  <SelectItem value="speeding">Quá tốc độ</SelectItem>
                  <SelectItem value="wrong-parking">Đỗ xe sai quy định</SelectItem>
                  <SelectItem value="no-helmet">Không đội mũ bảo hiểm</SelectItem>
                  <SelectItem value="lane-violation">Lấn làn</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensePlate">Biển số xe (nếu có)</Label>
              <Input
                id="licensePlate"
                placeholder="VD: 30A-12345"
                value={form.licensePlate}
                onChange={(e) => setForm((p) => ({ ...p, licensePlate: e.target.value }))}
              />
            </div>
          </div>

          {/* --- Địa điểm --- */}
          <div className="space-y-2">
            <Label htmlFor="location">Địa điểm vi phạm *</Label>
            <Input
              id="location"
              placeholder="VD: Ngã tư Láng Hạ - Thái Hà, Hà Nội"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              required
            />
          </div>

          {/* --- Ngày & Giờ --- */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Ngày vi phạm *</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Thời gian vi phạm *</Label>
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* --- Mô tả --- */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết *</Label>
            <Textarea
              id="description"
              placeholder="Mô tả chi tiết về vi phạm, hoàn cảnh xảy ra..."
              rows={4}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              required
            />
          </div>

          {/* --- File --- */}
          <div className="space-y-2">
            <Label htmlFor="evidence">Bằng chứng (ảnh/video)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Kéo thả file hoặc click để chọn</p>
              <Input
                id="evidence"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => setForm((p) => ({ ...p, evidence: e.target.files?.[0] || null }))}
              />
              <Button type="button" variant="outline" onClick={() => document.getElementById("evidence")?.click()}>
                Chọn file
              </Button>
              {form.evidence && (
                <p className="text-sm text-success mt-2">Đã chọn: {form.evidence.name}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={submitting}>Lưu nháp</Button>
            <Button type="submit" disabled={submitting}>
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Đang gửi..." : "Gửi báo cáo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  )
}
