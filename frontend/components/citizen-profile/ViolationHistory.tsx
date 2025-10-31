"use client"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

interface Violation {
  date: string
  type: string
  licensePlate: string
  fine: string
  status: "paid" | "unpaid"
}

interface Props {
  violations: Violation[]
}

export function ViolationHistory({ violations }: Props) {
  if (violations.length === 0)
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Không có lịch sử vi phạm</p>
      </div>
    )

  return (
    <div className="space-y-4">
      {violations.map((v, i) => (
        <Card key={i}>
          <CardHeader className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{v.type}</span>
                <Badge className={v.status === "paid" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                  {v.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Biển số: {v.licensePlate}</p>
              <p className="text-xs text-muted-foreground">Ngày vi phạm: {v.date}</p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${v.status === "paid" ? "text-success" : "text-destructive"}`}>{v.fine}</p>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
