"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { User, Trash2, Shield, Clock, UserX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Officer } from "@/hooks/useOfficers"

interface Props {
  officers: Officer[]
}


export function OfficerList({ officers }: Props) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Handle empty or undefined officers array
  const officerArray = Array.isArray(officers) ? officers : []

  const filteredOfficers = officerArray.filter((officer: Officer) => {
    const matchesSearch =
      (officer.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      officer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.position?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || officer.status === statusFilter
  
    return matchesSearch && matchesStatus
  })
  
  

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Không xác định</Badge>
    
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Đang hoạt động</Badge>
      case "inactive":
        return <Badge variant="secondary">Không hoạt động</Badge>
      case "suspended":
        return <Badge className="bg-destructive text-destructive-foreground">Tạm ngưng</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Tìm kiếm theo tên, email, ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="inactive">Không hoạt động</SelectItem>
            <SelectItem value="suspended">Tạm ngưng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty state when no officers */}
      {officerArray.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserX className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Chưa có cán bộ nào</p>
            <p className="text-sm text-muted-foreground mt-2">Vui lòng thêm cán bộ mới để bắt đầu</p>
          </CardContent>
        </Card>
      ) : filteredOfficers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserX className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Không tìm thấy cán bộ</p>
            <p className="text-sm text-muted-foreground mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </CardContent>
        </Card>
      ) : (
        filteredOfficers.map((officer) => (
        <Card key={officer.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{officer.name || "Không có tên"}</CardTitle>
                  <p className="text-sm text-muted-foreground">{officer.position || "Không có chức vụ"} • {officer.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(officer.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{officer.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Điện thoại</p>
                <p className="font-medium">{officer.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phòng ban</p>
                <p className="font-medium">{officer.department || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ngày tham gia</p>
                <p className="font-medium">{officer.joinDate || "N/A"}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm"><Shield className="h-4 w-4 mr-2"/>Phân quyền</Button>
              <Button variant="outline" size="sm"><Clock className="h-4 w-4 mr-2"/>Lịch sử hoạt động</Button>
              {officer.status === "active" && <Button variant="outline" size="sm" className="text-destructive bg-transparent"><Trash2 className="h-4 w-4 mr-2"/>Vô hiệu hóa</Button>}
            </div>
          </CardContent>
        </Card>
        ))
      )}
    </div>
  )
}
