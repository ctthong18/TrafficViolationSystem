"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { User, Edit, Trash2, Shield, Clock } from "lucide-react"
import { Officer } from "@/hooks/useOfficers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Props {
  officers: Officer[]
}

export function OfficerList({ officers }: Props) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredOfficers = officers.filter((officer) => {
    const matchesSearch =
      officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || officer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
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

      {filteredOfficers.map((officer) => (
        <Card key={officer.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{officer.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{officer.position} • {officer.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(officer.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Thông tin email, phone, department, joinDate, lastLogin, assignedCases, completedCases */}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm"><Shield className="h-4 w-4 mr-2"/>Phân quyền</Button>
              <Button variant="outline" size="sm"><Clock className="h-4 w-4 mr-2"/>Lịch sử hoạt động</Button>
              {officer.status === "active" && <Button variant="outline" size="sm" className="text-destructive bg-transparent"><Trash2 className="h-4 w-4 mr-2"/>Vô hiệu hóa</Button>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
