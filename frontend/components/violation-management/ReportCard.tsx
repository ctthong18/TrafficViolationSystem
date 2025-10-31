"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileText } from "lucide-react"
import type { Report } from "../../hooks/useViolations"

export function ReportCard({ data }: { data: Report }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success text-success-foreground">Đã xác minh</Badge>
      case "reviewing":
        return <Badge className="bg-warning text-warning-foreground">Đang xem xét</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            {data.id}
          </CardTitle>
          {getStatusBadge(data.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Loại vi phạm:</p>
            <p className="font-medium">{data.type}</p>
            <p className="text-sm text-muted-foreground mt-2">Địa điểm:</p>
            <p className="font-medium">{data.location}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Người báo cáo:</p>
            <p className="font-medium">{data.reporter}</p>
            <p className="text-sm mt-2">{data.description}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
          </Button>
          {data.status === "reviewing" && (
            <>
              <Button size="sm" className="bg-success text-success-foreground">
                Xác minh
              </Button>
              <Button variant="outline" size="sm">
                Từ chối
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
