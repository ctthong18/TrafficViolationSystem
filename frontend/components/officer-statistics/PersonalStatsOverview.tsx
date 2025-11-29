"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { PersonalStat } from "@/hooks/useOfficerStats"

interface Props {
  stats?: PersonalStat[]
}

export function PersonalStatsOverview({ stats = []}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const isUp = stat.trend === "up"
        const isDown = stat.trend === "down"
        const isNeutral = stat.trend === "neutral"

        const trendIcon = isUp ? (
          <TrendingUp className="h-3 w-3 text-success" />
        ) : isDown ? (
          <TrendingDown className="h-3 w-3 text-destructive" />
        ) : (
          <Minus className="h-3 w-3 text-muted-foreground" />
        )

        const trendColor = isUp
          ? "text-success"
          : isDown
          ? "text-destructive"
          : "text-muted-foreground"

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>

              {stat.change && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {trendIcon}
                  <span className={trendColor}>{stat.change}</span>
                  {stat.description && <span>{stat.description}</span>}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
