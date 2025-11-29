"use client"

import { useState } from "react"
import { Payment } from "./payment-type"

export interface WalletSummary {
  wallet_balance: number
  total_deposited: number
  total_paid_fines: number
  pending_fines: number
  available_balance: number
  can_auto_pay: boolean
}

export function useWallet() {
  const [summary, setSummary] = useState<WalletSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("access_token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) throw new Error("API URL not set")
      
      const res = await fetch(`${apiUrl}/v1/payments/wallet/summary`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!res.ok) throw new Error("Không thể tải thông tin ví")
      const data: WalletSummary = await res.json()
      setSummary(data)
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const deposit = async (amount: number, method: string) => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("access_token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) throw new Error("API URL not set")
      
      const res = await fetch(`${apiUrl}/v1/payments/wallet/deposit?amount=${amount}&payment_method=${method}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!res.ok) throw new Error("Nạp tiền vào ví thất bại")
      const data: Payment = await res.json()
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { summary, loading, error, fetchSummary, deposit, setSummary }
}
