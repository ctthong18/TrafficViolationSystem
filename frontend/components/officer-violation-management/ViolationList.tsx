"use client"

import ViolationCard from "./ViolationCard"
import { Violation } from "../../hooks/useViolations"

interface Props {
  violations: Violation[]
  status: "pending" | "reviewing" | "verified"
  onProcess: (id: string, action: string, note: string) => void
}

export default function ViolationList({ violations, status, onProcess }: Props) {
  const filtered = violations.filter((v) => v.status === status)

  if (filtered.length === 0 && status === "verified") {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Chưa có vi phạm nào được xác nhận hôm nay</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filtered.map((violation) => (
        <ViolationCard key={violation.id} violation={violation} onProcess={onProcess} />
      ))}
    </div>
  )
}
