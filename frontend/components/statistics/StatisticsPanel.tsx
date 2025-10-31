"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatsOverview } from "./StatsOverview"
import { ViolationTrendChart } from "./ViolationTrendChart"
import { ViolationTypePie } from "./ViolationTypePie"
import { LocationBarChart } from "./LocationBarChart"
import { ProcessingEfficiency } from "./ProcessingEfficiency"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function StatisticsPanel() {
  const [timeRange, setTimeRange] = useState("7days")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const res = await fetch(`${API_URL}/statistics?range=${timeRange}`)
      const json = await res.json()
      setData(json)
      setLoading(false)
    }
    fetchData()
  }, [timeRange])

  if (loading) return <p>Đang tải dữ liệu...</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Thống kê và báo cáo</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Chọn thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 ngày qua</SelectItem>
            <SelectItem value="30days">30 ngày qua</SelectItem>
            <SelectItem value="3months">3 tháng qua</SelectItem>
            <SelectItem value="year">Năm nay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <StatsOverview stats={data.overview} />
      <div className="grid gap-6 md:grid-cols-2">
        <ViolationTrendChart trends={data.trends} />
        <ViolationTypePie types={data.types} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <LocationBarChart locations={data.locations} />
        <ProcessingEfficiency efficiency={data.efficiency} />
      </div>
    </div>
  )
}
