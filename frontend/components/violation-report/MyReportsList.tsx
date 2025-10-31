"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { ReportCard } from "./ReportCard"

export function MyReportsList({
  reports,
  loading,
  onRefresh
}: {
  reports: any[]
  loading: boolean
  onRefresh: () => void
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Đang tải dữ liệu...</CardContent>
      </Card>
    )
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Bạn chưa có báo cáo nào</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} onRefresh={onRefresh} />
      ))}
    </div>
  )
}
