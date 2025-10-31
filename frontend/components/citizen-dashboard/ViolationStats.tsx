"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, CreditCard, FileText } from "lucide-react"
import { Violation } from "@/hooks/useViolations"

interface Props {
  violations: Violation[]
}

export function ViolationStats({ violations }: Props) {
  const stats = [
    {
      title: "Vi phạm chưa thanh toán",
      value: violations.filter((v) => v.status === "unpaid").length.toString(),
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      title: "Vi phạm đã thanh toán",
      value: violations.filter((v) => v.status === "paid").length.toString(),
      icon: CheckCircle,
      color: "text-success",
    },
    {
      title: "Tổng số tiền phạt chưa thanh toán",
      value:
        violations
          .filter((v) => v.status === "unpaid")
          .reduce((sum, v) => sum + Number.parseInt(v.fine.replace(/[^\d]/g, "")), 0)
          .toLocaleString("vi-VN") + " VNĐ",
      icon: CreditCard,
      color: "text-destructive",
    },
    {
      title: "Báo cáo đã gửi",
      value: "3",
      icon: FileText,
      color: "text-primary",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
