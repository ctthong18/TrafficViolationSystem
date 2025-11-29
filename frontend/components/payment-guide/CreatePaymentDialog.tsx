"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { useCitizenViolations } from "@/hooks/useViolations"
import { useCreateFinePayment } from "@/hooks/useCreateFinePayment"
import { useToast } from "@/components/ui/use-toast"

interface CreatePaymentDialogProps {
  open: boolean
  onClose: () => void
  onPaymentCreated?: () => void
}

export function CreatePaymentDialog({ open, onClose, onPaymentCreated }: CreatePaymentDialogProps) {
  const { violations, loading, error } = useCitizenViolations()
  const { createFinePayment, loading: creating } = useCreateFinePayment()
  const { toast } = useToast()
  const [selectedViolations, setSelectedViolations] = useState<Set<string>>(new Set())

  // Filter unpaid violations
  const unpaidViolations = violations.filter(v => 
    v.status === "confirmed" || v.status === "pending" || v.status === "verified"
  )

  useEffect(() => {
    if (!open) {
      setSelectedViolations(new Set())
    }
  }, [open])

  const handleToggleViolation = (violationId: string) => {
    const newSelected = new Set(selectedViolations)
    if (newSelected.has(violationId)) {
      newSelected.delete(violationId)
    } else {
      newSelected.add(violationId)
    }
    setSelectedViolations(newSelected)
  }

  const handleCreatePayments = async () => {
    if (selectedViolations.size === 0) {
      toast({
        title: "Chưa chọn vi phạm",
        description: "Vui lòng chọn ít nhất một vi phạm để tạo hóa đơn",
        variant: "destructive"
      })
      return
    }

    let successCount = 0
    let failCount = 0

    for (const violationId of selectedViolations) {
      const result = await createFinePayment(Number(violationId))
      if (result) {
        successCount++
      } else {
        failCount++
      }
    }

    if (successCount > 0) {
      toast({
        title: "Tạo hóa đơn thành công",
        description: `Đã tạo ${successCount} hóa đơn thanh toán${failCount > 0 ? `, ${failCount} thất bại` : ""}`,
      })
      onPaymentCreated?.()
      onClose()
    } else {
      toast({
        title: "Tạo hóa đơn thất bại",
        description: "Không thể tạo hóa đơn cho các vi phạm đã chọn",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo hóa đơn từ vi phạm</DialogTitle>
          <DialogDescription>
            Chọn các vi phạm chưa thanh toán để tạo hóa đơn
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Đang tải danh sách vi phạm...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        ) : unpaidViolations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Không có vi phạm chưa thanh toán</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Tìm thấy {unpaidViolations.length} vi phạm chưa thanh toán
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {unpaidViolations.map((violation) => (
                <Card key={violation.id} className="cursor-pointer hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedViolations.has(violation.id)}
                        onCheckedChange={() => handleToggleViolation(violation.id)}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{violation.type}</span>
                          {violation.fine && (
                            <span className="font-bold text-primary">
                              {violation.fine.toLocaleString()} đ
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>Biển số: {violation.license_plate}</div>
                          <div>Địa điểm: {violation.location}</div>
                          <div>Thời gian: {violation.time}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Đã chọn: {selectedViolations.size} vi phạm
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={creating}>
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreatePayments} 
                  disabled={creating || selectedViolations.size === 0}
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    `Tạo ${selectedViolations.size} hóa đơn`
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
