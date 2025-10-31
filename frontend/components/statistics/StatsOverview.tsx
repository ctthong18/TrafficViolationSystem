import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

export function StatsOverview({ stats }: { stats: any[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                {stat.trend === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
                <span
                  className={
                    stat.trend === "up"
                      ? "text-success"
                      : stat.trend === "down"
                      ? "text-destructive"
                      : ""
                  }
                >
                  {stat.change}
                </span>
                {stat.trend !== "stable" && " so với kỳ trước"}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
