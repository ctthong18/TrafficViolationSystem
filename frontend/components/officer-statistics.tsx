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
import { TrendingUp, TrendingDown, CheckCircle, Clock, Award, Target } from "lucide-react"
import { useState } from "react"

export function OfficerStatistics() {
  const [timeRange, setTimeRange] = useState("30days")

  const dailyPerformance = [
    { date: "09/12", processed: 8, assigned: 10, avgTime: 2.1 },
    { date: "10/12", processed: 12, assigned: 14, avgTime: 1.8 },
    { date: "11/12", processed: 6, assigned: 8, avgTime: 2.5 },
    { date: "12/12", processed: 15, assigned: 16, avgTime: 1.6 },
    { date: "13/12", processed: 9, assigned: 11, avgTime: 2.0 },
    { date: "14/12", processed: 11, assigned: 13, avgTime: 1.9 },
    { date: "15/12", processed: 8, assigned: 12, avgTime: 2.1 },
  ]

  const violationTypeStats = [
    { name: "Vượt đèn đỏ", processed: 25, color: "#ef4444" },
    { name: "Quá tốc độ", processed: 32, color: "#f97316" },
    { name: "Không đội mũ bảo hiểm", processed: 18, color: "#eab308" },
    { name: "Đỗ xe sai quy định", processed: 14, color: "#22c55e" },
    { name: "Khác", processed: 11, color: "#6366f1" },
  ]

  const monthlyComparison = [
    { month: "T9", thisYear: 89, lastYear: 76 },
    { month: "T10", thisYear: 95, lastYear: 82 },
    { month: "T11", thisYear: 103, lastYear: 88 },
    { month: "T12", thisYear: 89, lastYear: 91 },
  ]

  const personalStats = [
    {
      title: "Tổng hoàn thành tháng này",
      value: "89",
      change: "+12",
      trend: "up",
      icon: CheckCircle,
      color: "text-success",
      description: "vụ vi phạm",
    },
    {
      title: "Thời gian xử lý trung bình",
      value: "1.9h",
      change: "-0.2h",
      trend: "up",
      icon: Clock,
      color: "text-primary",
      description: "so với tháng trước",
    },
    {
      title: "Tỷ lệ hoàn thành đúng hạn",
      value: "94.2%",
      change: "+2.1%",
      trend: "up",
      icon: Target,
      color: "text-success",
      description: "trong tháng này",
    },
    {
      title: "Xếp hạng trong đơn vị",
      value: "#2",
      change: "+1",
      trend: "up",
      icon: Award,
      color: "text-warning",
      description: "trên 35 cán bộ",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Thống kê cá nhân</h2>
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

      {/* Personal Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {personalStats.map((stat, index) => (
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
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span className={stat.trend === "up" ? "text-success" : "text-destructive"}>{stat.change}</span>{" "}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hiệu suất hàng ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyPerformance}>
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
                  dataKey="assigned"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Được phân công"
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
            <CardTitle>Phân loại vi phạm đã xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={violationTypeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="processed"
                >
                  {violationTypeStats.map((entry, index) => (
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
            <div className="grid grid-cols-1 gap-2 mt-4">
              {violationTypeStats.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                    <span className="text-sm">{type.name}</span>
                  </div>
                  <span className="text-sm font-medium">{type.processed} vụ</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>So sánh theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="lastYear" fill="hsl(var(--muted-foreground))" name="Năm trước" />
                <Bar dataKey="thisYear" fill="hsl(var(--primary))" name="Năm nay" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thành tích và mục tiêu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Mục tiêu tháng này</span>
                  <span className="font-medium">89/100 vụ</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "89%" }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Còn 11 vụ để đạt mục tiêu</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tỷ lệ chính xác</span>
                  <span className="font-medium">96.2%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: "96%" }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Vượt mục tiêu 95%</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Thời gian xử lý</span>
                  <span className="font-medium">1.9h/2.5h</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: "76%" }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Nhanh hơn 24% so với mục tiêu</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-medium mb-3">Thành tích nổi bật</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-warning" />
                  <span>Cán bộ xuất sắc tháng 11/2024</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-success" />
                  <span>Hoàn thành 100% mục tiêu Q3/2024</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Cải thiện hiệu suất 15% so với Q2</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "15/12/2024", activity: "Hoàn thành 8 vụ vi phạm", type: "success" },
              { date: "14/12/2024", activity: "Hoàn thành 11 vụ vi phạm", type: "success" },
              { date: "13/12/2024", activity: "Hoàn thành 9 vụ vi phạm", type: "success" },
              { date: "12/12/2024", activity: "Hoàn thành 15 vụ vi phạm - Kỷ lục cá nhân", type: "highlight" },
              { date: "11/12/2024", activity: "Hoàn thành 6 vụ vi phạm", type: "success" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <div className={`w-2 h-2 rounded-full ${item.type === "highlight" ? "bg-warning" : "bg-success"}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.activity}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                {item.type === "highlight" && <Award className="h-4 w-4 text-warning" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
