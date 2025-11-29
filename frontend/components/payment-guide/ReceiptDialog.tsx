"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useReceipt } from "@/hooks/useReceipt"
import { Loader2, Printer, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ReceiptDialogProps {
  paymentId: number | null
  onClose: () => void
}

export function ReceiptDialog({ paymentId, onClose }: ReceiptDialogProps) {
  const { receipt, loading, error, fetchReceipt, downloadReceipt } = useReceipt()
  const { toast } = useToast()

  useEffect(() => {
    if (paymentId) {
      fetchReceipt(paymentId)
    }
  }, [paymentId])

  const handlePrint = async () => {
    if (!paymentId) return
    
    const result = await downloadReceipt(paymentId)
    if (result) {
      toast({
        title: "In hóa đơn",
        description: "Đang mở cửa sổ in...",
      })
    } else {
      toast({
        title: "Lỗi",
        description: "Không thể in hóa đơn",
        variant: "destructive"
      })
    }
  }

  const handleDownload = () => {
    if (!receipt) return
    
    // Create a printable HTML version for download
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Hóa đơn ${receipt.receipt_number}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1a1a1a;
              font-size: 24px;
              margin: 10px 0;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .receipt-number {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin: 20px 0;
              color: #2563eb;
            }
            .info-section {
              margin: 20px 0;
            }
            .info-row {
              display: flex;
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: bold;
              width: 200px;
              color: #374151;
            }
            .info-value {
              flex: 1;
              color: #1f2937;
            }
            .amount-section {
              margin: 30px 0;
              padding: 20px;
              background-color: #f9fafb;
              border-radius: 8px;
            }
            .amount-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
            }
            .total-row {
              font-size: 18px;
              font-weight: bold;
              color: #1a1a1a;
              border-top: 2px solid #d1d5db;
              padding-top: 12px;
              margin-top: 12px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HÓA ĐƠN THANH TOÁN PHẠT VI PHẠM GIAO THÔNG</h1>
            <p>Hệ thống quản lý phạt nguội giao thông</p>
          </div>
          
          <div class="receipt-number">
            Số hóa đơn: ${receipt.receipt_number}
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <div class="info-label">Ngày thanh toán:</div>
              <div class="info-value">${new Date(receipt.payment_date).toLocaleString("vi-VN")}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Mã vi phạm:</div>
              <div class="info-value">${receipt.violation_code}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Biển số xe:</div>
              <div class="info-value">${receipt.license_plate}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Loại vi phạm:</div>
              <div class="info-value">${receipt.violation_type}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Địa điểm vi phạm:</div>
              <div class="info-value">${receipt.location}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Thời gian vi phạm:</div>
              <div class="info-value">${new Date(receipt.violation_time).toLocaleString("vi-VN")}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Phương thức thanh toán:</div>
              <div class="info-value">${getPaymentMethodLabel(receipt.payment_method)}</div>
            </div>
          </div>
          
          <div class="amount-section">
            <div class="amount-row">
              <span>Số tiền phạt:</span>
              <span>${receipt.amount.toLocaleString("vi-VN")} đ</span>
            </div>
            <div class="amount-row">
              <span>Phí trễ hạn:</span>
              <span>${receipt.late_fee.toLocaleString("vi-VN")} đ</span>
            </div>
            <div class="amount-row total-row">
              <span>Tổng cộng:</span>
              <span>${receipt.total_amount.toLocaleString("vi-VN")} đ</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Hóa đơn này được tạo tự động bởi hệ thống</p>
            <p>Vui lòng giữ hóa đơn để làm bằng chứng thanh toán</p>
          </div>
        </body>
      </html>
    `
    
    const blob = new Blob([printContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hoa-don-${receipt.receipt_number}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Tải xuống thành công",
      description: "Hóa đơn đã được tải về máy",
    })
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      bank_transfer: "Chuyển khoản ngân hàng",
      credit_card: "Thẻ tín dụng",
      e_wallet: "Ví điện tử",
      qr_code: "Thanh toán QR",
      wallet: "Ví điện tử"
    }
    return methods[method] || method
  }

  return (
    <Dialog open={!!paymentId} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hóa đơn thanh toán</DialogTitle>
          <DialogDescription>
            Chi tiết hóa đơn thanh toán phạt vi phạm giao thông
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Đang tải hóa đơn...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        ) : receipt ? (
          <div className="space-y-6">
            {/* Receipt Header */}
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">HÓA ĐƠN THANH TOÁN PHẠT VI PHẠM</h3>
              <p className="text-sm text-muted-foreground">Hệ thống quản lý phạt nguội giao thông</p>
              <p className="text-lg font-bold text-primary">Số: {receipt.receipt_number}</p>
            </div>

            <Separator />

            {/* Receipt Details */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Ngày thanh toán:</span>
                <span className="col-span-2">{new Date(receipt.payment_date).toLocaleString("vi-VN")}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Mã vi phạm:</span>
                <span className="col-span-2">{receipt.violation_code}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Biển số xe:</span>
                <span className="col-span-2 font-mono">{receipt.license_plate}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Loại vi phạm:</span>
                <span className="col-span-2">{receipt.violation_type}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Địa điểm:</span>
                <span className="col-span-2">{receipt.location}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Thời gian vi phạm:</span>
                <span className="col-span-2">{new Date(receipt.violation_time).toLocaleString("vi-VN")}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Phương thức:</span>
                <span className="col-span-2">{getPaymentMethodLabel(receipt.payment_method)}</span>
              </div>
            </div>

            <Separator />

            {/* Amount Details */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Số tiền phạt:</span>
                <span className="font-semibold">{receipt.amount.toLocaleString("vi-VN")} đ</span>
              </div>
              
              <div className="flex justify-between">
                <span>Phí trễ hạn:</span>
                <span className="font-semibold">{receipt.late_fee.toLocaleString("vi-VN")} đ</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-primary">{receipt.total_amount.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>Hóa đơn này được tạo tự động bởi hệ thống</p>
              <p>Vui lòng giữ hóa đơn để làm bằng chứng thanh toán</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handlePrint} disabled={loading}>
                <Printer className="mr-2 h-4 w-4" />
                In hóa đơn
              </Button>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Tải xuống
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
