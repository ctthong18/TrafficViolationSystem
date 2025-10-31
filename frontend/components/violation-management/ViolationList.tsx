"use client"
import { ViolationCard } from "./ViolationCard"
import type { Violation } from "../../hooks/useViolations"

export function ViolationList({ data }: { data: Violation[] }) {
  if (!data.length) return <p className="text-center text-muted-foreground">Không có vi phạm nào</p>
  return <div className="space-y-4">{data.map((v) => <ViolationCard key={v.id} data={v} />)}</div>
}
