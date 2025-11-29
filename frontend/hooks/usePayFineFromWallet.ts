"use client"

import { useState } from "react"
import { Payment } from "./payment-type"

export function usePayFineFromWallet() {
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pay = async (paymentId: number) => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/v1/payments/fines/${paymentId}/pay-from-wallet`, {
        method: "POST"
      })
      if (!res.ok) throw new Error("Thanh toán từ ví thất bại")
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

  return { payment, loading, error, pay, setPayment }
}
