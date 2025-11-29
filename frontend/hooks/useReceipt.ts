"use client"

import { useState } from "react"

export interface Receipt {
  receipt_number: string
  payment_date: string
  violation_code: string
  license_plate: string
  violation_type: string
  amount: number
  late_fee: number
  total_amount: number
  payment_method: string
  location: string
  violation_time: string
}

export function useReceipt() {
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReceipt = async (paymentId: number) => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("access_token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) throw new Error("API URL not set")
      
      const res = await fetch(`${apiUrl}/v1/payments/${paymentId}/receipt`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!res.ok) throw new Error("Không thể tải hóa đơn")
      const data: Receipt = await res.json()
      setReceipt(data)
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const downloadReceipt = async (paymentId: number) => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("access_token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) throw new Error("API URL not set")
      
      const res = await fetch(`${apiUrl}/v1/payments/${paymentId}/receipt`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!res.ok) throw new Error("Không thể tải hóa đơn")
      const data: Receipt = await res.json()
      
      // Create a printable version
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Hóa đơn ${data.receipt_number}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; }
                .info { margin: 10px 0; }
                .label { font-weight: bold; }
              </style>
            </head>
            <body>
              <h1>HÓA ĐƠN THANH TOÁN PHẠT VI PHẠM</h1>
              <div class="info"><span class="label">Số hóa đơn:</span> ${data.receipt_number}</div>
              <div class="info"><span class="label">Ngày thanh toán:</span> ${data.payment_date}</div>
              <div class="info"><span class="label">Mã vi phạm:</span> ${data.violation_code}</div>
              <div class="info"><span class="label">Biển số xe:</span> ${data.license_plate}</div>
              <div class="info"><span class="label">Loại vi phạm:</span> ${data.violation_type}</div>
              <div class="info"><span class="label">Địa điểm:</span> ${data.location}</div>
              <div class="info"><span class="label">Thời gian vi phạm:</span> ${data.violation_time}</div>
              <div class="info"><span class="label">Số tiền phạt:</span> ${data.amount.toLocaleString('vi-VN')} VNĐ</div>
              <div class="info"><span class="label">Phí trễ hạn:</span> ${data.late_fee.toLocaleString('vi-VN')} VNĐ</div>
              <div class="info"><span class="label">Tổng cộng:</span> ${data.total_amount.toLocaleString('vi-VN')} VNĐ</div>
              <div class="info"><span class="label">Phương thức thanh toán:</span> ${data.payment_method}</div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
      
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { receipt, loading, error, fetchReceipt, downloadReceipt, setReceipt }
}
