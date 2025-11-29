import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, DollarSign } from "lucide-react"

interface StatsOverviewProps {
  stats: {
    total_violations: number
    pending_violations: number
    processed_violations: number
    total_revenue: number
    processing_rate: number
  }
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const formattedStats = [
    {
      title: "Tổng vi phạm",
      value: stats.total_violations.toLocaleString(),
      icon: Activity,
      color: "text-primary",
      change: `${stats.processing_rate.toFixed(1)}% đã xử lý`
    },
    {
      title: "Chờ xử lý",
      value: stats.pending_violations.toLocaleString(),
      icon: AlertTriangle,
      color: "text-warning",
      change: `${((stats.pending_violations / stats.total_violations) * 100).toFixed(1)}% tổng số`
    },
    {
      title: "Đã xử lý",
      value: stats.processed_violations.toLocaleString(),
      icon: CheckCircle,
      color: "text-success",
      change: `${stats.processing_rate.toFixed(1)}% hoàn thành`
    },
    {
      title: "Tổng thu",
      value: `${(stats.total_revenue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: "text-green-600",
      change: "VNĐ"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {formattedStats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
