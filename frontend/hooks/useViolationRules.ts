"use client"

import { useState, useCallback } from "react"

export interface ViolationRule {
  id: number
  code: string
  description: string
  points_bike: number | null
  points_car: number | null
  fine_min_bike: number | null
  fine_max_bike: number | null
  fine_min_car: number | null
  fine_max_car: number | null
  law_reference: string
  created_at?: string
  updated_at?: string
}

export function useViolationRules() {
  const [rules, setRules] = useState<ViolationRule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetched, setFetched] = useState(false) // track if already fetched

  const fetchRules = useCallback(async (search?: string) => {
    // nếu đã fetch và không có search mới thì return luôn
    if (fetched && !search) return rules

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("access_token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) throw new Error("API URL not set")

      const url = new URL(`${apiUrl}/v1/violation-rules`)
      if (search) url.searchParams.append("search", search)

      const res = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Không thể tải danh sách quy định vi phạm")
      const data = await res.json()
      setRules(data.items || [])
      setFetched(true) // đánh dấu đã fetch
      return data.items || []
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [fetched, rules])

  return { rules, loading, error, fetchRules, setRules }
}
