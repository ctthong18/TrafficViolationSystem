"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { UserPlus } from "lucide-react"

interface Props {
  onCreated?: () => void
}

export function CreateOfficerDialog({ onCreated }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const handleCreate = () => {
    // TODO: Call API create officer
    setIsOpen(false)
    onCreated?.()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Tạo tài khoản mới
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo tài khoản cán bộ mới</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" placeholder="Nhập họ và tên" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Chức vụ</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chức vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lieutenant">Thiếu úy</SelectItem>
                  <SelectItem value="first-lieutenant">Trung úy</SelectItem>
                  <SelectItem value="captain">Đại úy</SelectItem>
                  <SelectItem value="major">Thiếu tá</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Các input khác: email, phone, department, username, password */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate}>Tạo tài khoản</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
