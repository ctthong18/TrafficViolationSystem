"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, TrendingDown, Minus, Users, CheckCircle, 
  Clock, Target, Award, Activity, UserX 
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { useOfficersStats } from "@/hooks/useOfficersStats"

interface OfficerPerformanceProps {
  compact?: boolean
}

export function OfficerPerformance({ compact = false }: OfficerPerformanceProps) {
  const { data, loading, error } = useOfficersStats()

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-success" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-destructive" />
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-success"
      case "down":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatIcon = (title: string) => {
    if (title.includes("vi phạm")) return CheckCircle
    if (title.includes("thời gian")) return Clock
    if (title.includes("tỷ lệ")) return Target
    if (title.includes("cán bộ")) return Users
    return Activity
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className={compact ? "p-4" : "p-6"}>
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className={`flex flex-col items-center justify-center ${compact ? 'py-8' : 'py-12'}`}>
          <UserX className={`${compact ? 'h-12 w-12' : 'h-16 w-16'} text-muted-foreground mb-4`} />
          <p className={`${compact ? 'text-base' : 'text-lg'} font-medium text-muted-foreground`}>
            Không thể tải dữ liệu thống kê
          </p>
          <p className="text-sm text-muted-foreground mt-2">{error || "Vui lòng thử lại sau"}</p>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Compact Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Thống kê hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.systemStats.slice(0, 3).map((stat, index) => {
              const Icon = getStatIcon(stat.title)
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{stat.title}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {getTrendIcon(stat.trend)}
                      <span className={getTrendColor(stat.trend)}>{stat.change}</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Top Performers Compact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              Top cán bộ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topPerformers.slice(0, 3).map((officer, index) => (
              <div key={officer.officerId} className="flex items-center justify-between p-2 border border-border rounded">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? "bg-yellow-500 text-white" :
                    index === 1 ? "bg-gray-400 text-white" :
                    "bg-orange-600 text-white"
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{officer.officerName}</p>
                    <p className="text-xs text-muted-foreground">{officer.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-success">{officer.completionRate.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.officerActivities.slice(0, 4).map((officer) => (
              <div key={officer.officerId} className="p-2 border border-border rounded">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{officer.officerName}</p>
                  <Badge variant={officer.status === "active" ? "default" : "secondary"} className="text-xs">
                    {officer.status === "active" ? "Hoạt động" : "Tạm dừng"}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Xử lý: {officer.totalProcessed}/{officer.totalAssigned}</span>
                  <span>{officer.completionRate.toFixed(1)}%</span>
                </div>
                <Progress value={officer.completionRate} className="h-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Performance Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.systemStats.map((stat, index) => {
          const Icon = getStatIcon(stat.title)
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {getTrendIcon(stat.trend)}
                  <span className={getTrendColor(stat.trend)}>{stat.change}</span>
                  <span>{stat.description}</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top cán bộ hiệu suất cao
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topPerformers.map((officer, index) => (
              <div key={officer.officerId} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? "bg-yellow-500 text-white" :
                    index === 1 ? "bg-gray-400 text-white" :
                    "bg-orange-600 text-white"
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{officer.officerName}</p>
                    <p className="text-sm text-muted-foreground">{officer.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">{officer.completionRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">tỷ lệ hoàn thành</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Daily Processing Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng xử lý hàng ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyProcessing}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-muted-foreground"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalAssigned" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  name="Được phân công" 
                />
                <Line 
                  type="monotone" 
                  dataKey="totalProcessed" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2} 
                  name="Đã xử lý" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Officer Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết hoạt động cán bộ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.officerActivities.map((officer) => (
              <div key={officer.officerId} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{officer.officerName}</p>
                      <p className="text-sm text-muted-foreground">{officer.position}</p>
                    </div>
                    <Badge variant={officer.status === "active" ? "default" : "secondary"}>
                      {officer.status === "active" ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</p>
                    <p className="text-lg font-bold text-success">{officer.completionRate.toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Đã xử lý</p>
                    <p className="font-medium">{officer.totalProcessed}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Được phân công</p>
                    <p className="font-medium">{officer.totalAssigned}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Thời gian TB</p>
                    <p className="font-medium">{officer.avgProcessingTime} ngày</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hoạt động gần đây</p>
                    <p className="font-medium">{officer.recentActivities}</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tiến độ</span>
                    <span>{officer.totalProcessed}/{officer.totalAssigned}</span>
                  </div>
                  <Progress value={officer.completionRate} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
