"use client"
import { useEffect, useState } from "react"
import { CheckCircle } from "lucide-react"
import { violationsApi, Violation } from "@/lib/api"
import { ViolationList } from "./ViolationList"

export function ProcessedList() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProcessed = async () => {
      try {
        setLoading(true)
        const data = await violationsApi.getProcessed({ limit: 100 })
        setViolations(data.violations)
      } catch (err: any) {
        setError(err.message || "Không thể tải danh sách vi phạm đã xử lý")
        console.error("Error fetching processed violations:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProcessed()
  }, [])

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-10">
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive py-10">
        <p>Lỗi: {error}</p>
      </div>
    )
  }

  if (violations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <p>Không có vi phạm đã xử lý nào</p>
      </div>
    )
  }

  return <ViolationList data={violations} />
}
