"use client"

import { useState } from "react"
import { Payment } from "./payment-type"

export function useCreateFinePayment() {
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createFinePayment = async (violationId: number) => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/v1/payments/fines/${violationId}`, {
        method: "POST"
      })
      if (!res.ok) throw new Error("Không thể tạo payment cho vi phạm")
      const data: Payment = await res.json()
      setPayment(data)
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { payment, loading, error, createFinePayment, setPayment }
}
