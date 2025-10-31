"use client"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOfficerStats } from "@/hooks/useOfficerStats"
import { PersonalStatsOverview } from "@/components/officer-statistics/PersonalStatsOverview"
import { ChartsOverview } from "@/components/officer-statistics/ChartsOverview"
import { RecentActivities } from "@/components/officer-statistics/RecentActivities"

export function OfficerStatistics() {
  const [timeRange, setTimeRange] = useState("30days")
  const { data, loading, error } = useOfficerStats()

  if (loading) return <p>Đang tải dữ liệu...</p>
  if (error || !data) return <p className="text-destructive">{error || "Không có dữ liệu"}</p>

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

      <PersonalStatsOverview stats={data.personalStats} />
      <ChartsOverview
        dailyPerformance={data.dailyPerformance}
        violationTypeStats={data.violationTypeStats}
        monthlyComparison={data.monthlyComparison}
      />
      <RecentActivities activities={data.recentActivities} />
    </div>
  )
}
