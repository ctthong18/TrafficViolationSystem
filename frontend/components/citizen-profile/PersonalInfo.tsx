"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X } from "lucide-react"

export function PersonalInfo() {
  const [data, setData] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPersonalInfo = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) return

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/citizen/personal-info`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Không thể tải thông tin cá nhân")

        const result = await res.json()
        setData(result)
      } catch (err) {
        console.error("Lỗi khi lấy thông tin cá nhân:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPersonalInfo()
  }, [])

  const handleSave = () => {
    // TODO: Gọi API update profile (PUT /personal-info)
    setIsEditing(false)
  }

  if (loading) return <p>Đang tải...</p>
  if (!data) return <p>Không có dữ liệu người dùng</p>

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
            <Label>Họ và tên</Label>
            <Input
              value={data.fullName || ""}
              onChange={(e) => setData({ ...data, fullName: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>Số CCCD/CMND</Label>
            <Input
              value={data.idNumber || ""}
              onChange={(e) => setData({ ...data, idNumber: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={data.email || ""}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>Số điện thoại</Label>
            <Input
              value={data.phone || ""}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ngày sinh</Label>
          <Input
            type="date"
            value={data.dateOfBirth ? data.dateOfBirth.split("T")[0] : ""}
            onChange={(e) => setData({ ...data, dateOfBirth: e.target.value })}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label>Địa chỉ</Label>
          <Input
            value={data.address || ""}
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
                <span>{new Date(data.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trạng thái:</span>
                <Badge className={data.isActive ? "bg-success" : "bg-destructive"}>
                  {data.isActive ? "Đã xác thực" : "Bị khóa"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lần đăng nhập cuối:</span>
                <span>
                  {data.lastLogin
                    ? new Date(data.lastLogin).toLocaleString("vi-VN")
                    : "Chưa có"}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
