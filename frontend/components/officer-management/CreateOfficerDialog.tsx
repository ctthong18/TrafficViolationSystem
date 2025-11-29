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
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    department: "",
    email: "",
    phone_number: "",
    username: "",
    password: "",
    identification_number: "",
    badge_number: "",
  })

  const handleCreate = async () => {
    // kiểm tra bắt buộc
    if (!formData.full_name || !formData.username || !formData.password) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("access_token")

      const payload = {
        ...formData,
        role: "officer", // 🔹 backend yêu cầu
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/users/officers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      const text = await res.text()
      if (!res.ok) throw new Error(text || "Không thể tạo tài khoản mới")

      alert("Tạo tài khoản thành công!")
      onCreated?.()
      setIsOpen(false)
      setFormData({
        full_name: "",
        department: "",
        email: "",
        phone_number: "",
        username: "",
        password: "",
        identification_number: "",
        badge_number: "",
      })
    } catch (err: any) {
      console.error(err)
      alert("Lỗi khi tạo tài khoản: " + err.message)
    } finally {
      setLoading(false)
    }
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
          {/* Họ tên & Đơn vị công tác */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Họ và tên</Label>
              <Input
                id="full_name"
                placeholder="Nhập họ và tên"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Đơn vị công tác</Label>
              <Input
                id="department"
                placeholder="Phòng CSGT số 1"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          {/* CCCD & Mã số hiệu */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="identification_number">Số CCCD</Label>
              <Input
                id="identification_number"
                placeholder="012345678901"
                value={formData.identification_number}
                onChange={(e) => setFormData({ ...formData, identification_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="badge_number">Mã số hiệu</Label>
              <Input
                id="badge_number"
                placeholder="CSGT-1234"
                value={formData.badge_number}
                onChange={(e) => setFormData({ ...formData, badge_number: e.target.value })}
              />
            </div>
          </div>

          {/* Email & Số điện thoại */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Số điện thoại</Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder="0123456789"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
          </div>

          {/* Tên đăng nhập & Mật khẩu */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
