"use client"

import { useState, useEffect } from "react"
import { usePayments } from "../../hooks/usePayment"
import { usePayFineFromWallet } from "../../hooks/usePayFineFromWallet"
import { useWallet } from "../../hooks/useWallet"
import { PaymentList } from "./PaymentList"
import { PaymentFilter } from "./PaymentFilter"
import { PaymentQRDialog } from "./PaymentQRDialog"
import { ReceiptDialog } from "./ReceiptDialog"
import { CreatePaymentDialog } from "./CreatePaymentDialog"
import { Payment } from "../../hooks/payment-type"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function PaymentGuide() {
  const { payments, loading, error, refetch } = usePayments()
  const { summary, fetchSummary } = useWallet()
  const { pay: payFromWallet } = usePayFineFromWallet()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [receiptPaymentId, setReceiptPaymentId] = useState<number | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Fetch wallet summary on mount
  useEffect(() => {
    fetchSummary()
  }, [])

  const handlePayFromWallet = async (payment: Payment) => {
    const result = await payFromWallet(payment.id)
    if (result) {
      toast({
        title: "Thanh toán thành công",
        description: "Đã thanh toán phạt từ ví của bạn",
      })
      refetch()
      fetchSummary()
    } else {
      toast({
        title: "Thanh toán thất bại",
        description: "Không thể thanh toán từ ví, vui lòng thử lại",
        variant: "destructive"
      })
    }
  }

  const handlePaymentCreated = () => {
    refetch()
  }

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.violation_code?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) return <p>Đang tải dữ liệu thanh toán...</p>
  if (error) return <p className="text-destructive">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PaymentFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo hóa đơn từ vi phạm
        </Button>
      </div>
      
      <PaymentList
        payments={filteredPayments}
        onSelectPayment={setSelectedPayment}
        onViewReceipt={setReceiptPaymentId}
        onPayFromWallet={handlePayFromWallet}
        walletBalance={summary?.wallet_balance || 0}
      />
      
      <PaymentQRDialog
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />
      
      <ReceiptDialog
        paymentId={receiptPaymentId}
        onClose={() => setReceiptPaymentId(null)}
      />
      
      <CreatePaymentDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onPaymentCreated={handlePaymentCreated}
      />
    </div>
  )
}
