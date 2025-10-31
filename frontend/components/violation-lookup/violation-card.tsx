"use client"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { Eye, CreditCard, FileText } from "lucide-react"
import type { Violation } from "../../hooks/useViolations"

export function ViolationCard({ violation }: { violation: Violation }) {
  return (
    <div className="p-4 border border-border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-lg">{violation.id}</span>
          <StatusBadge status={violation.status} />
        </div>
        <div className="text-right">
          <p
            className={`text-xl font-bold ${
              violation.status === "unpaid" ? "text-destructive" : "text-success"
            }`}
          >
            {violation.fine}
          </p>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <Info label="Loại vi phạm" value={violation.type} />
        <Info label="Biển số" value={violation.licensePlate} />
        <Info label="Địa điểm" value={violation.location} />
        <Info label="Thời gian" value={violation.time} />
      </div>

      {violation.status === "unpaid" && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <p className="text-sm text-warning-foreground">
            <strong>Hạn nộp phạt:</strong> {violation.dueDate}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Vui lòng thanh toán trước hạn để tránh bị tăng mức phạt
          </p>
        </div>
      )}

      {violation.status === "paid" && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-3">
          <p className="text-sm text-success-foreground">
            <strong>Đã thanh toán:</strong> {violation.paidDate}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Xem bằng chứng
        </Button>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Tải quyết định
        </Button>
        {violation.status === "unpaid" && (
          <Button size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            Thanh toán ngay
          </Button>
        )}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm text-muted-foreground">{label}:</span>
      <p className="font-medium">{value}</p>
    </div>
  )
}
