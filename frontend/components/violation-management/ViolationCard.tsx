"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, User, AlertTriangle } from "lucide-react"
import type { Violation } from "../../hooks/useViolations"

export function ViolationCard({ data }: { data: Violation }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return <Badge className="bg-success text-success-foreground">Đã xử lý</Badge>
      case "pending":
        return <Badge variant="secondary">Chờ xử lý</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-warning" />
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
            <p className="text-sm text-muted-foreground">Biển số:</p>
            <p className="font-medium">{data.licensePlate}</p>
            <p className="text-sm text-muted-foreground mt-2">Mức phạt:</p>
            <p className="font-medium text-warning">{data.fine}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" /> Xem bằng chứng
          </Button>
          {data.status === "pending" && (
            <Button size="sm">
              <User className="h-4 w-4 mr-2" /> Phân công xử lý
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
