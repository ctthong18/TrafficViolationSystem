"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Camera, Users } from "lucide-react"
import { useState } from "react"

export function StatisticsPanel() {
  const [timeRange, setTimeRange] = useState("7days")

  const violationTrends = [
    { date: "09/12", violations: 45, processed: 38 },
    { date: "10/12", violations: 52, processed: 45 },
    { date: "11/12", violations: 38, processed: 35 },
    { date: "12/12", violations: 61, processed: 52 },
    { date: "13/12", violations: 49, processed: 44 },
    { date: "14/12", violations: 56, processed: 48 },
    { date: "15/12", violations: 67, processed: 58 },
  ]

  const violationTypes = [
    { name: "Vượt đèn đỏ", value: 35, color: "#ef4444" },
    { name: "Quá tốc độ", value: 28, color: "#f97316" },
    { name: "Không đội mũ bảo hiểm", value: 20, color: "#eab308" },
    { name: "Đỗ xe sai quy định", value: 12, color: "#22c55e" },
    { name: "Khác", value: 5, color: "#6366f1" },
  ]

  const locationStats = [
    { location: "Ngã tư Láng Hạ", violations: 23 },
    { location: "Đại lộ Thăng Long", violations: 19 },
    { location: "Cầu Nhật Tân", violations: 15 },
    { location: "Phố Huế", violations: 12 },
    { location: "Ngã tư Sở", violations: 8 },
  ]

  const stats = [
    {
      title: "Tổng vi phạm tuần này",
      value: "368",
      change: "+12.5%",
      trend: "up",
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      title: "Tỷ lệ xử lý",
      value: "87.2%",
      change: "+3.1%",
      trend: "up",
      icon: CheckCircle,
      color: "text-success",
    },
    {
      title: "Camera hoạt động",
      value: "142/150",
      change: "94.7%",
      trend: "stable",
      icon: Camera,
      color: "text-primary",
    },
    {
      title: "Cán bộ đang làm việc",
      value: "28/35",
      change: "80%",
      trend: "stable",
      icon: Users,
      color: "text-primary",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Thống kê và báo cáo</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 ngày qua</SelectItem>
            <SelectItem value="30days">30 ngày qua</SelectItem>
            <SelectItem value="3months">3 tháng qua</SelectItem>
            <SelectItem value="year">Năm nay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : stat.trend === "down" ? (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                ) : null}
                <span
                  className={stat.trend === "up" ? "text-success" : stat.trend === "down" ? "text-destructive" : ""}
                >
                  {stat.change}
                </span>
                {stat.trend !== "stable" && " so với tuần trước"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng vi phạm theo ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={violationTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="violations"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                  name="Vi phạm"
                />
                <Line
                  type="monotone"
                  dataKey="processed"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  name="Đã xử lý"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân loại vi phạm</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={violationTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {violationTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {violationTypes.map((type, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                  <span className="text-sm">{type.name}</span>
                  <span className="text-sm text-muted-foreground">({type.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Địa điểm vi phạm nhiều nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationStats} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-muted-foreground" />
                <YAxis dataKey="location" type="category" width={120} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="violations" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiệu suất xử lý</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Thời gian xử lý trung bình</span>
                <span className="font-medium">2.3 giờ</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: "76%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tỷ lệ xử lý đúng hạn</span>
                <span className="font-medium">89.2%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "89%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Độ chính xác phát hiện</span>
                <span className="font-medium">94.7%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-warning h-2 rounded-full" style={{ width: "95%" }} />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-success">247</p>
                  <p className="text-sm text-muted-foreground">Xử lý hôm nay</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">58</p>
                  <p className="text-sm text-muted-foreground">Đang chờ</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
