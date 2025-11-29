"use client"

import { Payment } from "../../hooks/payment-type"
import { PaymentCard } from "./PaymentCard"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet } from "lucide-react"

interface PaymentListProps {
  payments: Payment[]
  onSelectPayment: (payment: Payment) => void
  onViewReceipt?: (paymentId: number) => void
  onPayFromWallet?: (payment: Payment) => void
  walletBalance?: number
}

export function PaymentList({ payments, onSelectPayment, onViewReceipt, onPayFromWallet, walletBalance }: PaymentListProps) {
  if (payments.length === 0)
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Không có giao dịch nào</p>
        </CardContent>
      </Card>
    )

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {payments.map((payment) => (
        <PaymentCard 
          key={payment.id} 
          payment={payment} 
          onSelect={onSelectPayment}
          onViewReceipt={onViewReceipt}
          onPayFromWallet={onPayFromWallet}
          walletBalance={walletBalance}
        />
      ))}
    </div>
  )
}
