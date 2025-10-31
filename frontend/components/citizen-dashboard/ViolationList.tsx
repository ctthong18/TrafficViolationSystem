"use client"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Violation } from "@/hooks/useViolations"

interface Props {
  violations: Violation[]
}

export function ViolationList({ violations }: Props) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unpaid":
        return <Badge className="bg-warning text-warning-foreground">Chưa thanh toán</Badge>
      case "paid":
        return <Badge className="bg-success text-success-foreground">Đã thanh toán</Badge>
      case "processing":
        return <Badge className="bg-primary text-primary-foreground">Đang xử lý</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Vi phạm gần đây</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {violations.map((violation) => (
            <div
              key={violation.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{violation.id}</span>
                  {getStatusBadge(violation.status)}
                </div>
                <p className="text-sm text-muted-foreground">{violation.type}</p>
                <p className="text-xs text-muted-foreground">
                  {violation.location} • {violation.time}
                </p>
                <p className="text-xs text-muted-foreground">Biển số: {violation.licensePlate}</p>
                {violation.status === "unpaid" && (
                  <p className="text-xs text-destructive">Hạn nộp: {violation.dueDate}</p>
                )}
                {violation.status === "paid" && (
                  <p className="text-xs text-success">Đã thanh toán: {violation.paidDate}</p>
                )}
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    violation.status === "unpaid" ? "text-destructive" : "text-success"
                  }`}
                >
                  {violation.fine}
                </p>
                {violation.status === "unpaid" && (
                  <Button size="sm" className="mt-2">
                    Thanh toán
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
