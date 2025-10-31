"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Send } from "lucide-react"
import { Card } from "@/components/ui/card"
import { violationsApi } from "@/lib/api"
import { NewViolationForm } from "./NewViolationForm"
import { MyReportsList } from "./MyReportsList"

export function ViolationReport() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch danh sách báo cáo
  const fetchReports = async () => {
    setLoading(true)
    try {
      const data = await violationsApi.getReports() // ← API thật
      setReports(data)
    } catch (err) {
      console.error("Lỗi tải danh sách báo cáo:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="new-report" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-report" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Báo cáo mới
          </TabsTrigger>
          <TabsTrigger value="my-reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Báo cáo của tôi ({reports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-report">
          <Card>
            <NewViolationForm onSubmitSuccess={fetchReports} />
          </Card>
        </TabsContent>

        <TabsContent value="my-reports">
          <MyReportsList reports={reports} loading={loading} onRefresh={fetchReports} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
