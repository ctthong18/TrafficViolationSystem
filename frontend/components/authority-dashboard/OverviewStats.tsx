"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useDashboardStats } from "@/hooks/useDashboard"

export interface Stat {
  title: string
  value: string
  change: string
  icon: "up" | "down" | "stable"
  color: string
}

export function OverviewStats() {
  const { stats, loading, error } = useDashboardStats()

  if (loading) return <p>Đang tải thống kê...</p>
  if (error) return <p className="text-destructive">{error}</p>
  if (!stats || stats.length === 0) return <p className="text-muted-foreground">Không có dữ liệu thống kê</p>

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon === "up" ? TrendingUp : stat.icon === "down" ? TrendingDown : null
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {Icon && <Icon className={`h-4 w-4 ${stat.color}`} />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith("+") ? "text-success" : "text-warning"}>
                  {stat.change}
                </span>{" "}
                so với hôm qua
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
