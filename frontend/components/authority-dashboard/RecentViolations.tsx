"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useRecentViolations } from "@/hooks/useDashboard"

export interface Violation {
  id: string
  type: string
  location: string
  time: string
  status: "processed" | "pending"
}

export function RecentViolations() {
  const { violations, loading, error } = useRecentViolations(10)

  if (loading) return <p>Đang tải vi phạm...</p>
  if (error) return <p className="text-destructive">{error}</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vi phạm gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        {violations.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Không có vi phạm gần đây</p>
        ) : (
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
        )}
      </CardContent>
    </Card>
  )
}
