"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wallet, Clock, AlertTriangle, Receipt } from "lucide-react"
import { Payment } from "../../hooks/payment-type"

interface PaymentCardProps {
  payment: Payment
  onSelect: (payment: Payment) => void
  onViewReceipt?: (paymentId: number) => void
  onPayFromWallet?: (payment: Payment) => void
  walletBalance?: number
}

export function PaymentCard({ payment, onSelect, onViewReceipt, onPayFromWallet, walletBalance = 0 }: PaymentCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-success">Đã thanh toán</Badge>
      case "pending": return <Badge className="bg-warning">Chờ thanh toán</Badge>
      case "failed": return <Badge className="bg-destructive">Thất bại</Badge>
      default: return <Badge variant="secondary">Khác</Badge>
    }
  }

  const getPaymentMethodBadge = (method?: string) => {
    if (!method) return null
    
    const methodLabels: Record<string, string> = {
      bank_transfer: "Chuyển khoản",
      credit_card: "Thẻ tín dụng",
      e_wallet: "Ví điện tử",
      qr_code: "QR Code",
      wallet: "Ví"
    }
    
    return <Badge variant="outline">{methodLabels[method] || method}</Badge>
  }

  const canPayFromWallet = payment.status === "pending" && walletBalance >= payment.amount

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {payment.receipt_number || `Payment #${payment.id}`}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(payment.status)}
            {payment.payment_method && getPaymentMethodBadge(payment.payment_method)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Mã vi phạm: <span className="font-medium text-foreground">{payment.violation_code || "N/A"}</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Số tiền</p>
            <p className="text-xl font-bold text-foreground">{payment.amount.toLocaleString()} đ</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Ngày hết hạn</p>
            <p className="text-sm">{payment.due_date || "N/A"}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {payment.status === "pending" ? (
            <>
              <Button variant="default" size="sm" onClick={() => onSelect(payment)}>
                <Clock className="h-4 w-4 mr-2" /> Thanh toán ngay
              </Button>
              {canPayFromWallet && onPayFromWallet && (
                <Button variant="secondary" size="sm" onClick={() => onPayFromWallet(payment)}>
                  <Wallet className="h-4 w-4 mr-2" /> Thanh toán từ ví
                </Button>
              )}
            </>
          ) : payment.status === "paid" ? (
            <>
              {onViewReceipt && (
                <Button variant="outline" size="sm" onClick={() => onViewReceipt(payment.id)}>
                  <Receipt className="h-4 w-4 mr-2" /> Xem hóa đơn
                </Button>
              )}
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onSelect(payment)}>
              <AlertTriangle className="h-4 w-4 mr-2" /> Thử lại
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
