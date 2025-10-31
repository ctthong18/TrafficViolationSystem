"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Eye, CheckCircle } from "lucide-react"
import { Violation } from "../../hooks/useViolations"
import { useState } from "react"

interface Props {
  violation: Violation
  onProcess: (id: string, action: string, note: string) => void
}

export default function ViolationDialog({ violation, onProcess }: Props) {
  const [note, setNote] = useState("")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          Xem chi tiết
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết vi phạm {violation.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Loại vi phạm</Label>
              <p className="text-sm">{violation.type}</p>
            </div>
            <div>
              <Label>Biển số xe</Label>
              <p className="text-sm">{violation.licensePlate}</p>
            </div>
            <div>
              <Label>Địa điểm</Label>
              <p className="text-sm">{violation.location}</p>
            </div>
            <div>
              <Label>Thời gian</Label>
              <p className="text-sm">{violation.time}</p>
            </div>
          </div>

          <div>
            <Label>Mô tả</Label>
            <p className="text-sm">{violation.description}</p>
          </div>

          <div>
            <Label>Bằng chứng</Label>
            <img
              src={violation.evidence || "/placeholder.svg"}
              alt="Evidence"
              className="w-full h-48 object-cover rounded-lg border"
            />
          </div>

          <div className="space-y-2">
            <Label>Ghi chú xử lý</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú về quá trình xử lý..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onProcess(violation.id, "approve", note || "Xác nhận vi phạm")}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Xác nhận vi phạm
            </Button>
            <Button
              variant="outline"
              onClick={() => onProcess(violation.id, "reject", note || "Từ chối vi phạm")}
              className="flex-1"
            >
              Từ chối
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
