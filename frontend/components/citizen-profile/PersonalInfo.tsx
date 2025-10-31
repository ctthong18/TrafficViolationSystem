"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X } from "lucide-react"

interface Props {
  data: any
  setData: (data: any) => void
}

export function PersonalInfo({ data, setData }: Props) {
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    // TODO: call API to save profile
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Thông tin cá nhân</CardTitle>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Lưu
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input
              id="fullName"
              value={data.fullName}
              onChange={(e) => setData({ ...data, fullName: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="idNumber">Số CCCD/CMND</Label>
            <Input
              id="idNumber"
              value={data.idNumber}
              onChange={(e) => setData({ ...data, idNumber: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Ngày sinh</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => setData({ ...data, dateOfBirth: e.target.value })}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Địa chỉ</Label>
          <Input
            id="address"
            value={data.address}
            onChange={(e) => setData({ ...data, address: e.target.value })}
            disabled={!isEditing}
          />
        </div>

        {!isEditing && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h4 className="font-medium text-primary mb-2">Thông tin tài khoản</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày tạo tài khoản:</span>
                <span>15/01/2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trạng thái:</span>
                <Badge className="bg-success text-success-foreground">Đã xác thực</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lần đăng nhập cuối:</span>
                <span>Hôm nay, 14:30</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
