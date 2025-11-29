"use client"
import { useOfficers } from "@/hooks/useOfficers"
import { CreateOfficerDialog } from "@/components/officer-management/CreateOfficerDialog"
import { OfficerList } from "@/components/officer-management/OfficerList"
import { OfficerPerformance } from "@/components/officer-management/OfficerPerformance"
import { Card, CardContent } from "@/components/ui/card"

interface OfficerManagementProps {
  filter?: string
}

export function OfficerManagement({ filter = "active" }: OfficerManagementProps) {
  const { officers, loading, error } = useOfficers()

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const filteredOfficers = officers?.filter((officer: any) => {
    if (filter === "active") return officer.status === "active"
    if (filter === "inactive") return officer.status === "inactive"
    return true
  }) || []

  return (
    <div className="space-y-6">
      {filter === "create" ? (
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-semibold mb-4">Thêm cán bộ mới</h3>
          <CreateOfficerDialog />
        </div>
      ) : filter === "settings" ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Tính năng cài đặt đang được phát triển</p>
          </CardContent>
        </Card>
      ) : filter === "active" || filter === "inactive" ? (
        <OfficerList officers={filteredOfficers} />
      ) : (
        <OfficerPerformance officers={filteredOfficers} />
      )}
    </div>
  )
}
