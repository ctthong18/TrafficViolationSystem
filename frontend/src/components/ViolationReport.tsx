"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Upload, Send, FileText } from "lucide-react"

export default function ViolationReport() {
  const [formData, setFormData] = useState({
    violationType: "",
    location: "",
    date: "",
    time: "",
    licensePlate: "",
    description: "",
    reporterName: "",
    reporterPhone: "",
    reporterEmail: "",
  })
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const violationTypes = [
    "Vượt đèn đỏ",
    "Quá tốc độ",
    "Không đội mũ bảo hiểm",
    "Đi ngược chiều",
    "Vượt ẩu",
    "Dừng đỗ sai quy định",
    "Không chấp hành hiệu lệnh",
    "Vi phạm khác",
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Report submitted:", { formData, files })
      setIsSubmitting(false)
      // Reset form or show success message
    }, 2000)
  }

  const recentReports = [
    {
      id: "RP001",
      type: "Vượt đèn đỏ",
      location: "Ngã tư Hoàn Kiếm",
      date: "14/01/2024",
      status: "processing",
    },
    {
      id: "RP002",
      type: "Quá tốc độ",
      location: "Đường Nguyễn Trãi",
      date: "10/01/2024",
      status: "completed",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo vi phạm giao thông</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="violation-type">Loại vi phạm *</Label>
                <Select
                  value={formData.violationType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, violationType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại vi phạm" />
                  </SelectTrigger>
                  <SelectContent>
                    {violationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm vi phạm *</Label>
                <Input
                  id="location"
                  placeholder="Ví dụ: Ngã tư Láng Hạ, Hà Nội"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Ngày vi phạm *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Thời gian *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="license-plate">Biển số xe (nếu có)</Label>
                <Input
                  id="license-plate"
                  placeholder="Ví dụ: 30A-12345"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, licensePlate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả chi tiết *</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về vi phạm, tình huống xảy ra..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Bằng chứng (ảnh, video)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      Nhấp để chọn file hoặc kéo thả file vào đây
                      <br />
                      Hỗ trợ: JPG, PNG, MP4 (tối đa 10MB mỗi file)
                    </p>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                          Xóa
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Thông tin người báo cáo</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reporter-name">Họ và tên *</Label>
                    <Input
                      id="reporter-name"
                      value={formData.reporterName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, reporterName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reporter-phone">Số điện thoại *</Label>
                    <Input
                      id="reporter-phone"
                      type="tel"
                      value={formData.reporterPhone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, reporterPhone: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reporter-email">Email</Label>
                    <Input
                      id="reporter-email"
                      type="email"
                      value={formData.reporterEmail}
                      onChange={(e) => setFormData((prev) => ({ ...prev, reporterEmail: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Đang gửi báo cáo...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Gửi báo cáo
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Báo cáo đã gửi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{report.id}</span>
                    <Badge variant={report.status === "completed" ? "default" : "secondary"}>
                      {report.status === "completed" ? "Đã xử lý" : "Đang xử lý"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{report.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {report.location} • {report.date}
                  </p>
                </div>
              ))}

              {recentReports.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có báo cáo nào được gửi</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
