"use client"
import { useState, useCallback } from "react"

export interface QRPaymentData {
  payment_id: number
  qr_url?: string  // QR URL từ VietQR
  qr_image_base64?: string  // Giữ lại để backward compatibility
  qr_transaction_id?: string
  amount: number
  bank_account?: string
  bank_name?: string
  transfer_content?: string
  qr_expiry_time?: string
}

export function usePaymentQRLog() {
  const [qrData, setQrData] = useState<QRPaymentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQR = useCallback(async (userId: number, paymentId: number) => {
    if (typeof window === "undefined") {
      console.warn("[QRLog] fetchQR called on server side")
      return
    }

    const controller = new AbortController()
    const signal = controller.signal

    try {
      setLoading(true)
      setError(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) throw new Error("API URL not set")

      console.log(`[QRLog] Fetching QR for userId=${userId}, paymentId=${paymentId}`)
      
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.error("[QRLog] No token found in localStorage")
        setError("Vui lòng đăng nhập để tải QR code")
        setQrData(null)
        setLoading(false)
        return
      }
      
      const res = await fetch(`${apiUrl}/v1/payments/payments/${paymentId}/qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error(`[QRLog] Failed to fetch QR: ${errText}`)
        throw new Error(errText || "Không thể tải QR code thanh toán")
      }

      const data: QRPaymentData = await res.json()
      if (data.amount) data.amount = Number(data.amount)

      console.log(`[QRLog] QR data received:`, data)
      setQrData(data)
    } catch (err: any) {
      if (err.name === "AbortError") return
      console.error("[QRLog] Error fetching QR:", err)
      setError(err.message || "Đã xảy ra lỗi khi tải QR code")
      setQrData(null)
    } finally {
      setLoading(false)
    }

    return () => controller.abort()
  }, [])

  const resetQR = useCallback(() => {
    console.log("[QRLog] Reset QR data")
    setQrData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { qrData, loading, error, fetchQR, resetQR, setQrData }
}
