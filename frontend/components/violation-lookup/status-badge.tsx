"use client"

import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status }: { status: string }) {
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
