"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileText } from "lucide-react"
import { Denunciation } from "@/hooks/useDenuciation"
import { getStatusBadge } from "./utils"

export function ReportCard({ report }: { report: Denunciation }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500 text-white"
      case "rejected":
        return "bg-red-500 text-white"
      case "pending":
        return "bg-yellow-500 text-white"
      case "verifying":
      case "investigating":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {report.denunciation_code || `TC-${report.id}`}
          </CardTitle>
          <Badge className={getStatusColor(report.status)}>
            {report.status === "resolved" ? "Đã giải quyết" :
             report.status === "rejected" ? "Từ chối" :
             report.status === "pending" ? "Chờ xử lý" :
             report.status === "verifying" ? "Đang xác minh" :
             report.status === "investigating" ? "Đang điều tra" :
             report.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-lg">{report.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
          </div>
          
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Loại tố cáo:</p>
              <p className="font-medium">{report.type}</p>
            </div>
            {report.location && (
              <div>
                <p className="text-sm text-muted-foreground">Địa điểm:</p>
                <p className="font-medium">{report.location}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Người tố cáo:</p>
              <p className="font-medium">{report.reporter || (report.is_anonymous ? 'Ẩn danh' : 'N/A')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày tạo:</p>
              <p className="font-medium">{new Date(report.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Xem chi tiết
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
