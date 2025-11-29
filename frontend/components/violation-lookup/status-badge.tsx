"use client"

import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-500 text-white">Đã thanh toán</Badge>
    case "unpaid":
      return <Badge className="bg-yellow-500 text-white">Chưa thanh toán</Badge>
    case "verified":
    case "approved":
      return <Badge className="bg-orange-500 text-white">Đã xác nhận</Badge>
    case "pending":
      return <Badge className="bg-blue-500 text-white">Chờ xử lý</Badge>
    case "reviewing":
      return <Badge className="bg-purple-500 text-white">Đang xem xét</Badge>
    case "rejected":
      return <Badge className="bg-red-500 text-white">Từ chối</Badge>
    case "processing":
      return <Badge className="bg-cyan-500 text-white">Đang xử lý</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
