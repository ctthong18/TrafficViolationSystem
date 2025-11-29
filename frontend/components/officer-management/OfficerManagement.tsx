"use client"
import { useOfficers } from "@/hooks/useOfficers"
import { CreateOfficerDialog } from "@/components/officer-management/CreateOfficerDialog"
import { OfficerList } from "@/components/officer-management/OfficerList"
import { OfficerPerformance } from "@/components/officer-management/OfficerPerformance"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, CheckCircle } from "lucide-react"

export function OfficerManagement() {
  const { officers, loading, error } = useOfficers()

  if (loading) return <p>Đang tải dữ liệu...</p>
  if (error) return <p className="text-destructive">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý cán bộ</h2>
        <CreateOfficerDialog />
      </div>

      <Tabs defaultValue="officers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="officers" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Danh sách cán bộ
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Hiệu suất làm việc
          </TabsTrigger>
        </TabsList>

        <TabsContent value="officers">
          <OfficerList officers={officers || []} />
        </TabsContent>

        <TabsContent value="performance">
          <OfficerPerformance officers={officers || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
