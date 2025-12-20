"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
        <Card key={officer.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-base">{officer.name || "Không có tên"}</h4>
                  <p className="text-xs text-muted-foreground">{officer.position || "Không có chức vụ"}</p>
                </div>
              </div>
              {getStatusBadge(officer.status)}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium truncate">{officer.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phòng ban</p>
                <p className="font-medium">{officer.department || "N/A"}</p>
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">
                <Shield className="h-3 w-3 mr-1"/>Chi tiết
              </Button>
              <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">
                <Clock className="h-3 w-3 mr-1"/>Hoạt động
              </Button>
              {officer.status === "active" && (
                <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7 text-destructive">
                  <Trash2 className="h-3 w-3 mr-1"/>Tắt
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        ))
      )}
    </div>
  )
}
