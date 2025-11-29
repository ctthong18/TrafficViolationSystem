"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { DailyPerformance, ViolationTypeStat, MonthlyComparison } from "@/hooks/useOfficerStats"

interface Props {
  dailyPerformance?: DailyPerformance[]
  violationTypeStats?: ViolationTypeStat[]
  monthlyComparison?: MonthlyComparison[]
}

export function ChartsOverview({
  dailyPerformance = [],
  violationTypeStats = [],
  monthlyComparison = [],
}: Props) {
  // pie chart data
  const pieChartData = violationTypeStats.map(stat => ({
    name: stat.name,
    processed: stat.processed,
    color: stat.color,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Performance LineChart */}
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
                <Line type="monotone" dataKey="assigned" stroke="hsl(var(--primary))" strokeWidth={2} name="Được phân công" />
                <Line type="monotone" dataKey="processed" stroke="hsl(var(--success))" strokeWidth={2} name="Đã xử lý" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Violation Type PieChart */}
        <Card>
          <CardHeader>
            <CardTitle>Phân loại vi phạm đã xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="processed"
                  >
                    {pieChartData.map((entry, index) => (
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
            ) : (
              <p className="text-center text-muted-foreground">Không có dữ liệu</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Comparison BarChart */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>So sánh theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyComparison.length > 0 ? (
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
            ) : (
              <p className="text-center text-muted-foreground">Không có dữ liệu</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
