"use client"
import { ViolationCard } from "./ViolationCard"
import type { Violation } from "../../hooks/useViolations"

export function ViolationList({ data }: { data: Violation[] }) {
  if (!data.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>Không có vi phạm nào</p>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      {data.map((v) => (
        <ViolationCard key={v.id} data={v} />
      ))}
    </div>
  )
}
