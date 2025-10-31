"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export interface Violation {
  id: string
  type: string
  location: string
  time: string
  status: "processed" | "pending"
}

export function RecentViolations() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/violations/recent`)
        if (!res.ok) throw new Error("Không thể tải dữ liệu vi phạm")
        const data: Violation[] = await res.json()
        setViolations(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchViolations()
  }, [])

  if (loading) return <p>Đang tải vi phạm...</p>
  if (error) return <p className="text-destructive">{error}</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vi phạm gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {violations.map((violation) => (
            <div key={violation.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{violation.id}</span>
                  <Badge variant={violation.status === "processed" ? "default" : "secondary"}>
                    {violation.status === "processed" ? "Đã xử lý" : "Chờ xử lý"}
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
