"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, CreditCard, FileText } from "lucide-react"
import { Violation } from "@/hooks/useViolations"

interface Props {
  violations: Violation[]
}

export function ViolationStats({ violations }: Props) {
  // Tính tổng số tiền phạt chưa thanh toán
  const unpaidViolations = violations.filter((v) => 
    v.status === "unpaid" || v.status === "verified" || v.status === "approved"
  )
  
  const totalUnpaidFine = unpaidViolations.reduce((sum, v) => {
    if (!v.fine) return sum
    const fineValue = typeof v.fine === 'number' 
      ? v.fine 
      : Number.parseInt(v.fine.toString().replace(/[^\d]/g, ""))
    return sum + (isNaN(fineValue) ? 0 : fineValue)
  }, 0)

  const stats = [
    {
      title: "Tổng vi phạm",
      value: violations.length.toString(),
      icon: AlertTriangle,
      color: "text-blue-600",
    },
    {
      title: "Chưa thanh toán",
      value: unpaidViolations.length.toString(),
      icon: AlertTriangle,
      color: "text-yellow-600",
    },
    {
      title: "Đã thanh toán",
      value: violations.filter((v) => v.status === "paid").length.toString(),
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Tổng tiền phạt chưa thanh toán",
      value: totalUnpaidFine.toLocaleString("vi-VN") + " VNĐ",
      icon: CreditCard,
      color: "text-red-600",
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
