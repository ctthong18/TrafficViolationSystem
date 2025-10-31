"use client"
import { ReportCard } from "./ReportCard"
import type { Report } from "../../hooks/useViolations"

export function ReportList({ data }: { data: Report[] }) {
  if (!data.length) return <p className="text-center text-muted-foreground">Chưa có báo cáo nào</p>
  return <div className="space-y-4">{data.map((r) => <ReportCard key={r.id} data={r} />)}</div>
}
