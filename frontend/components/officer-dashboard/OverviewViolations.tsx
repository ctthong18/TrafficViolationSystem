"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import type { Violation } from "@/hooks/useViolations" // Import từ file types

export function OverviewViolations() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('access_token')
        // Giả sử đây là endpoint mới chỉ để lấy vi phạm
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/officer/dashboard/violations`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) throw new Error("Không thể tải vi phạm")
        
        const data: Violation[] = await res.json()
        setViolations(data) // Sử dụng dữ liệu
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchViolations()
  }, [])

  if (loading) return <p>Đang tải vi phạm...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vi phạm cần xử lý</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {violations?.map((violation) => (
            <div
              key={violation.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{violation.id}</span>
                  <Badge
                    variant={
                      violation.priority === "high"
                        ? "destructive"
                        : violation.priority === "medium"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {violation.priority === "high"
                      ? "Ưu tiên cao"
                      : violation.priority === "medium"
                      ? "Ưu tiên trung bình"
                      : "Ưu tiên thấp"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{violation.type}</p>
                <p className="text-xs text-muted-foreground">
                  {violation.location} • {violation.time}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}