"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StatusBadge } from "./status-badge"
import { Eye, CreditCard, FileText, MessageSquare } from "lucide-react"
import { ComplaintForm } from "@/components/complaint/ComplaintForm"
import type { Violation } from "../../hooks/useViolations"

export function ViolationCard({ violation }: { violation: Violation }) {
  const [showComplaintDialog, setShowComplaintDialog] = useState(false)
  return (
    <div className="p-4 border border-border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-lg">Vi phạm #{violation?.id}</span>
          <StatusBadge status={violation?.status} />
        </div>
        {violation.fine && (
          <div className="text-right">
            <p
              className={`text-xl font-bold ${
                violation.status === "unpaid" || violation.status === "verified" ? "text-destructive" : "text-success"
              }`}
            >
              {violation.fine.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <Info label="Loại vi phạm" value={violation.type} />
        <Info label="Biển số" value={violation.license_plate} />
        <Info label="Địa điểm" value={violation.location || 'N/A'} />
        <Info label="Thời gian" value={`${violation.date || ''} ${violation.time || ''}`.trim()} />
      </div>

      {violation.description && (
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm">
            <strong>Mô tả:</strong> {violation.description}
          </p>
        </div>
      )}

      {(violation.status === "verified" || violation.status === "unpaid") && violation.fine && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <p className="text-sm text-warning-foreground">
            <strong>Mức phạt:</strong> {violation.fine.toLocaleString('vi-VN')} VNĐ
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Vui lòng thanh toán để hoàn tất xử lý vi phạm
          </p>
        </div>
      )}

      {violation.status === "paid" && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-3">
          <p className="text-sm text-success-foreground">
            <strong>Đã thanh toán</strong>
          </p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {violation.evidence && (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Xem bằng chứng
          </Button>
        )}
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Tải quyết định
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowComplaintDialog(true)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Khiếu nại
        </Button>
        {(violation.status === "verified" || violation.status === "unpaid") && violation.fine && (
          <Button size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            Thanh toán ngay
          </Button>
        )}
      </div>
      
      {/* Dialog khiếu nại */}
      <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Khiếu nại vi phạm #{violation.id}</DialogTitle>
          </DialogHeader>
          <ComplaintForm
            violationId={parseInt(violation.id)}
            onSuccess={() => setShowComplaintDialog(false)}
            onCancel={() => setShowComplaintDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm text-muted-foreground">{label}:</span>
      <p className="font-medium">{value || 'N/A'}</p>
    </div>
  )
}
