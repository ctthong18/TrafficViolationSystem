import { Badge } from "@/components/ui/badge"

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "reviewing":
      return <Badge className="bg-yellow-100 text-yellow-800">Đang xem xét</Badge>
    case "verified":
      return <Badge className="bg-green-100 text-green-800">Đã xác minh</Badge>
    case "rejected":
      return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>
    default:
      return <Badge variant="outline">Không xác định</Badge>
  }
}
