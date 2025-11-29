"use client"

import { useEffect, useState } from "react"

export interface Payment {
  id: number
  receipt_number?: string
  violation_code?: string
  amount: number
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled"
  due_date?: string
  paid_at?: string
  payment_method?: "bank_transfer" | "credit_card" | "e_wallet"
  type?: "fine" | "wallet_deposit"
  qr_url?: string  // QR URL từ VietQR
  qr_image_base64?: string  // Giữ lại để backward compatibility
  qr_expiry_time?: string
  bank_name?: string
  transfer_content?: string
  qr_transaction_id?: string
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("access_token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) throw new Error("API URL not set")
      const res = await fetch(`${apiUrl}/v1/payments/my-payments`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error("Không thể tải danh sách thanh toán")
      const data: Payment[] = await res.json()
      setPayments(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  return { payments, loading, error, setPayments, refetch: fetchPayments }
}
