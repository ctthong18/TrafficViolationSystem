"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Plus, Loader2, Calendar, MapPin } from "lucide-react"
import { violationsApi, ViolationReport } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface Report {
  id: string
  type: string
  location: string
  date: string
  time: string
  license_plate?: string
  description: string
  status: string
  created_at: string
}

export function MyReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newReport, setNewReport] = useState<Partial<ViolationReport>>({
    type: "",
    location: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm"),
    description: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const data = await violationsApi.getProcessed()
      // Map to Report format
      setReports(data.violations.map(v => ({
        id: v.id,
        type: v.type,
        location: v.location,
        date: v.date || "",
        time: v.time,
        license_plate: v.license_plate,
        description: v.description || "",
        status: v.status,
        created_at: v.detected_at || new Date().toISOString()
      })))
    } catch (error: any) {
      toast({
        title: "Lỗi tải báo cáo",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!newReport.type || !newReport.location || !newReport.description) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    try {
      await violationsApi.createReport(newReport as ViolationReport)
      
      toast({
        title: "Gửi báo cáo thành công",
        description: "Báo cáo của bạn đã được gửi và đang chờ xử lý",
      })

      setDialogOpen(false)
      setNewReport({
        type: "",
        location: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm"),
        description: "",
      })
      loadReports()
    } catch (error: any) {
      toast({
        title: "Lỗi gửi báo cáo",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="secondary">Đang chờ</Badge>
      case "processing":
        return <Badge variant="default">Đang xử lý</Badge>
      case "resolved":
        return <Badge className="bg-green-600">Đã xử lý</Badge>
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Báo cáo vi phạm của tôi</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo báo cáo mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tạo báo cáo vi phạm</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Loại vi phạm *</Label>
                    <Select
                      value={newReport.type}
                      onValueChange={(v) => setNewReport({ ...newReport, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại vi phạm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="speeding">Vượt quá tốc độ</SelectItem>
                        <SelectItem value="red_light">Vượt đèn đỏ</SelectItem>
                        <SelectItem value="wrong_lane">Đi sai làn</SelectItem>
                        <SelectItem value="no_helmet">Không đội mũ bảo hiểm</SelectItem>
                        <SelectItem value="parking">Đỗ xe sai quy định</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ngày *</Label>
                      <Input
                        type="date"
                        value={newReport.date}
                        onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Giờ *</Label>
                      <Input
                        type="time"
                        value={newReport.time}
                        onChange={(e) => setNewReport({ ...newReport, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Địa điểm *</Label>
                    <Input
                      placeholder="VD: Ngã tư Lê Lợi - Trần Hưng Đạo"
                      value={newReport.location}
                      onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Biển số xe (nếu có)</Label>
                    <Input
                      placeholder="VD: 29A-12345"
                      value={newReport.license_plate || ""}
                      onChange={(e) => setNewReport({ ...newReport, license_plate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mô tả chi tiết *</Label>
                    <Textarea
                      placeholder="Mô tả chi tiết về vi phạm..."
                      rows={4}
                      value={newReport.description}
                      onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Gửi báo cáo
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Reports List */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Bạn chưa có báo cáo nào</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{report.type}</h3>
                        {getStatusBadge(report.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {report.date} {report.time}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {report.location}
                        </div>
                      </div>

                      {report.license_plate && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Biển số: </span>
                          <span className="font-mono font-semibold">{report.license_plate}</span>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground">{report.description}</p>

                      <div className="text-xs text-muted-foreground">
                        Gửi lúc: {format(new Date(report.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
