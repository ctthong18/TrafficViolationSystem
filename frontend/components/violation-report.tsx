"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Upload, Send, Eye } from "lucide-react"
import { violationsApi } from "@/lib/api"

export function ViolationReport() {
  const [reportForm, setReportForm] = useState({
    type: "",
    location: "",
    time: "",
    date: "",
    licensePlate: "",
    description: "",
    evidence: null as File | null,
  })

  const [myReports] = useState([
    {
      id: "RP-001",
      type: "Đỗ xe sai quy định",
      location: "Phố Hoàn Kiếm",
      time: "10:30 - 14/12/2024",
      status: "reviewing",
      description: "Xe ô tô đỗ trên vỉa hè, cản trở giao thông người đi bộ",
      submittedDate: "14/12/2024",
    },
    {
      id: "RP-002",
      type: "Lấn làn",
      location: "Cầu Chương Dương",
      time: "09:15 - 12/12/2024",
      status: "verified",
      description: "Xe máy chạy vào làn ô tô",
      submittedDate: "12/12/2024",
      processedDate: "13/12/2024",
    },
    {
      id: "RP-003",
      type: "Vượt đèn đỏ",
      location: "Ngã tư Cầu Giấy",
      time: "16:45 - 10/12/2024",
      status: "rejected",
      description: "Xe ô tô vượt đèn đỏ",
      submittedDate: "10/12/2024",
      processedDate: "11/12/2024",
      reason: "Bằng chứng không đủ rõ ràng",
    },
  ])

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await violationsApi.createReport({
        type: reportForm.type,
        location: reportForm.location,
        time: reportForm.time,
        date: reportForm.date,
        license_plate: reportForm.licensePlate || undefined,
        description: reportForm.description,
        evidence: reportForm.evidence || undefined,
      } as any)

      setReportForm({
        type: "",
        location: "",
        time: "",
        date: "",
        licensePlate: "",
        description: "",
        evidence: null,
      })
      alert("Báo cáo đã được gửi thành công!")
    } catch (err) {
      alert("Gửi báo cáo thất bại. Vui lòng thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reviewing":
        return <Badge className="bg-warning text-warning-foreground">Đang xem xét</Badge>
      case "verified":
        return <Badge className="bg-success text-success-foreground">Đã xác minh</Badge>
      case "rejected":
        return <Badge className="bg-destructive text-destructive-foreground">Từ chối</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="new-report" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-report" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Báo cáo mới
          </TabsTrigger>
          <TabsTrigger value="my-reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Báo cáo của tôi ({myReports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-report">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo vi phạm giao thông</CardTitle>
              <p className="text-sm text-muted-foreground">
                Vui lòng cung cấp thông tin chi tiết và bằng chứng rõ ràng để hỗ trợ quá trình xử lý
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Loại vi phạm *</Label>
                    <Select
                      value={reportForm.type}
                      onValueChange={(value) => setReportForm((prev) => ({ ...prev, type: value }))}
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
                      value={reportForm.licensePlate}
                      onChange={(e) => setReportForm((prev) => ({ ...prev, licensePlate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm vi phạm *</Label>
                  <Input
                    id="location"
                    placeholder="VD: Ngã tư Láng Hạ - Thái Hà, Hà Nội"
                    value={reportForm.location}
                    onChange={(e) => setReportForm((prev) => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Ngày vi phạm *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={reportForm.date}
                      onChange={(e) => setReportForm((prev) => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Thời gian vi phạm *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={reportForm.time}
                      onChange={(e) => setReportForm((prev) => ({ ...prev, time: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả chi tiết *</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả chi tiết về vi phạm, hoàn cảnh xảy ra..."
                    rows={4}
                    value={reportForm.description}
                    onChange={(e) => setReportForm((prev) => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

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
                      onChange={(e) => setReportForm((prev) => ({ ...prev, evidence: e.target.files?.[0] || null }))}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("evidence")?.click()}
                    >
                      Chọn file
                    </Button>
                    {reportForm.evidence && (
                      <p className="text-sm text-success mt-2">Đã chọn: {reportForm.evidence.name}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Hỗ trợ: JPG, PNG, MP4. Tối đa 10MB</p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-medium text-primary mb-2">Lưu ý quan trọng:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cung cấp thông tin chính xác và trung thực</li>
                    <li>• Bằng chứng phải rõ ràng, không mờ hoặc bị che khuất</li>
                    <li>• Báo cáo sai sự thật có thể bị xử lý theo quy định pháp luật</li>
                    <li>• Thời gian xử lý: 3-5 ngày làm việc</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" disabled={submitting}>
                    Lưu nháp
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? "Đang gửi..." : "Gửi báo cáo"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-reports" className="space-y-4">
          {myReports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {report.id}
                  </CardTitle>
                  {getStatusBadge(report.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Loại vi phạm:</span>
                      <p className="font-medium">{report.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Địa điểm:</span>
                      <p className="font-medium">{report.location}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Thời gian vi phạm:</span>
                      <p className="font-medium">{report.time}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Ngày gửi báo cáo:</span>
                      <p className="font-medium">{report.submittedDate}</p>
                    </div>
                    {report.processedDate && (
                      <div>
                        <span className="text-sm text-muted-foreground">Ngày xử lý:</span>
                        <p className="font-medium">{report.processedDate}</p>
                      </div>
                    )}
                    {report.reason && (
                      <div>
                        <span className="text-sm text-muted-foreground">Lý do từ chối:</span>
                        <p className="font-medium text-destructive">{report.reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-sm text-muted-foreground">Mô tả:</span>
                  <p className="text-sm mt-1">{report.description}</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Xem chi tiết
                  </Button>
                  {report.status === "reviewing" && (
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {myReports.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Bạn chưa có báo cáo nào</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
