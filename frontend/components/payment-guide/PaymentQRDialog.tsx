"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"
import { Payment } from "../../hooks/payment-type"
import { usePaymentQRLog } from "../../hooks/usePaymentQR"

interface PaymentQRDialogProps {
  payment: Payment | null
  onClose: () => void
}

export function PaymentQRDialog({ payment, onClose }: PaymentQRDialogProps) {
  const { qrData, loading, error, fetchQR } = usePaymentQRLog()

  useEffect(() => {
    if (!payment?.id) return
    if (typeof window === "undefined") return // tránh SSR

    const user = localStorage.getItem("user")
    const userId = user ? JSON.parse(user).id : null

    if (!userId) {
      console.error("[QRLog] No userId found in localStorage")
      return
    }

    fetchQR(userId, payment.id)
  }, [payment?.id, fetchQR])

  if (!payment) return null

  // Ưu tiên QR URL, fallback về base64 nếu có
  const qrUrl = qrData?.qr_url || payment.qr_url
  const qrImageBase64 = qrData?.qr_image_base64 || payment.qr_image_base64

  return (
    <Dialog open={!!payment} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Thanh toán qua QR</DialogTitle>
          <DialogDescription>
            Quét mã QR để thanh toán khoản phí vi phạm của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {loading ? (
            <p>Đang tải QR code...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : qrUrl ? (
            <Image
              src={qrUrl}
              alt="QR code để thanh toán"
              width={220}
              height={220}
              unoptimized
            />
          ) : qrImageBase64 ? (
            <Image
              src={`data:image/png;base64,${qrImageBase64}`}
              alt="QR code để thanh toán"
              width={220}
              height={220}
              unoptimized
            />
          ) : (
            <p>Không có QR code</p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Số tiền: <strong>{Number(qrData?.amount || payment.amount).toLocaleString()} đ</strong>
          </p>

          <p className="text-center text-sm">
            Hạn QR:{" "}
            {(qrData?.qr_expiry_time || payment.qr_expiry_time)
              ? new Date(qrData?.qr_expiry_time || payment.qr_expiry_time!).toLocaleString("vi-VN")
              : "Chưa có"}
          </p>

          {qrData?.bank_name && (
            <div className="text-center text-sm">
              <p className="text-muted-foreground">Ngân hàng: {qrData.bank_name}</p>
              {qrData.transfer_content && (
                <p className="text-muted-foreground">Nội dung: {qrData.transfer_content}</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
