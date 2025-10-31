import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function ProcessingEfficiency({ efficiency }: { efficiency: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hiệu suất xử lý</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Hiển thị chi tiết efficiency từ API */}
        <div className="flex justify-between text-sm">
          <span>Thời gian xử lý trung bình</span>
          <span className="font-medium">{efficiency.avgTime} giờ</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-1">
          <div className="bg-success h-2 rounded-full" style={{ width: `${efficiency.rate}%` }} />
        </div>
      </CardContent>
    </Card>
  )
}
