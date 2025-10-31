"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

export interface Stat {
  title: string
  value: string
  change: string
  icon: "up" | "down" | "stable"
  color: string
}

export function OverviewStats() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`)
        if (!res.ok) throw new Error("Không thể tải dữ liệu thống kê")
        const data: Stat[] = await res.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <p>Đang tải thống kê...</p>
  if (error) return <p className="text-destructive">{error}</p>

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
