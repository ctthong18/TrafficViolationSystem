"use client"

import { useCallback } from "react"
import { useViolationRules } from "@/hooks/useViolationRules"
import { ViolationRulesSearch } from "../violation-rules/ViolationRulesSearch"
import { ViolationRulesTable } from "../violation-rules/ViolationRulesTable"

export function ViolationRulesView() {
  const { rules, loading, fetchRules } = useViolationRules()

  const handleSearch = useCallback((query: string) => {
    fetchRules(query)
  }, [fetchRules])

  return (
    <div className="space-y-6">
      <ViolationRulesSearch onSearch={handleSearch} loading={loading} />
      <ViolationRulesTable rules={rules} loading={loading} />
    </div>
  )
}
