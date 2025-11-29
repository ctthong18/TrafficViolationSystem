"use client"

import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Send } from "lucide-react"
import { Card } from "@/components/ui/card"
import { NewViolationForm } from "./NewViolationForm"
import { MyReportsList } from "./MyReportsList"
import { useDenunciations } from "@/hooks/useDenuciation"

export function ViolationReport() {
  const {
    denunciations,
    loading,
    fetchDenunciations, // <- dùng cái này để fetch dữ liệu
  } = useDenunciations()

  useEffect(() => {
    fetchDenunciations()
  }, [fetchDenunciations])

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
            Báo cáo của tôi ({denunciations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-report">
          <Card>
            <NewViolationForm onSubmitSuccess={fetchDenunciations} />
          </Card>
        </TabsContent>

        <TabsContent value="my-reports">
          <MyReportsList
            reports={denunciations}
            loading={loading}
            onRefresh={fetchDenunciations}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
