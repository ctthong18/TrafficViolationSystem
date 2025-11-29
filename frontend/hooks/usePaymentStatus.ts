"use client"

import { useState } from "react"

export interface PaymentStatusData {
  payment_id: number
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled"
  amount: number
  paid_at?: string
  qr_expiry?: string
}

export function usePaymentStatus() {
  const [statusData, setStatusData] = useState<PaymentStatusData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async (paymentId: number) => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/v1/payments/payment/${paymentId}/status`)
      if (!res.ok) throw new Error("Không thể lấy trạng thái payment")
      const data: PaymentStatusData = await res.json()
      setStatusData(data)
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { statusData, loading, error, checkStatus, setStatusData }
}
