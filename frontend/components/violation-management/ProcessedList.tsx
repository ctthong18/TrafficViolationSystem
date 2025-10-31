"use client"
import { CheckCircle } from "lucide-react"

export function ProcessedList() {
  return (
    <div className="text-center text-muted-foreground py-10">
      <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
      Danh sách vi phạm đã xử lý sẽ hiển thị ở đây.
    </div>
  )
}
