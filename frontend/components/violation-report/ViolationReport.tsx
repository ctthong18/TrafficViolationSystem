"use client"

import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { NewViolationForm } from "./NewViolationForm"
import { MyReportsList } from "./MyReportsList"
import { useDenunciations } from "@/hooks/useDenuciation"

interface ViolationReportProps {
  activeSubTab: string
}

export function ViolationReport({ activeSubTab }: ViolationReportProps) {
  const {
    denunciations,
    loading,
    fetchDenunciations,
  } = useDenunciations()

  useEffect(() => {
    fetchDenunciations()
  }, [fetchDenunciations])

  return (
    <div className="space-y-6">
      {activeSubTab === "new-report" && (
        <Card>
          <NewViolationForm onSubmitSuccess={fetchDenunciations} />
        </Card>
      )}

      {activeSubTab === "my-reports" && (
        <MyReportsList
          reports={denunciations}
          loading={loading}
          onRefresh={fetchDenunciations}
        />
      )}
    </div>
  )
}
