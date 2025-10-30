"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, UserPlus, Search, Edit, Trash2, Shield, Clock, CheckCircle } from "lucide-react"

export function OfficerManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const officers = [
    {
      id: "OF-001",
      name: "Nguyễn Văn A",
      email: "nguyenvana@csgt.gov.vn",
      phone: "0123456789",
      department: "Phòng CSGT Hà Nội",
      position: "Trung úy",
      status: "active",
      assignedCases: 12,
      completedCases: 89,
      joinDate: "15/01/2020",
      lastLogin: "2 giờ trước",
    },
    {
      id: "OF-002",
      name: "Trần Thị B",
      email: "tranthib@csgt.gov.vn",
      phone: "0987654321",
      department: "Phòng CSGT Hà Nội",
      position: "Thiếu úy",
      status: "active",
      assignedCases: 8,
      completedCases: 156,
      joinDate: "22/03/2019",
      lastLogin: "30 phút trước",
    },
    {
      id: "OF-003",
      name: "Lê Văn C",
      email: "levanc@csgt.gov.vn",
      phone: "0369852147",
      department: "Phòng CSGT Hà Nội",
      position: "Đại úy",
      status: "inactive",
      assignedCases: 0,
      completedCases: 203,
      joinDate: "10/07/2018",
      lastLogin: "3 ngày trước",
    },
  ]

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

  const CreateOfficerForm = () => (
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="email@csgt.gov.vn" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input id="phone" placeholder="0123456789" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Phòng ban</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Chọn phòng ban" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hanoi">Phòng CSGT Hà Nội</SelectItem>
            <SelectItem value="hcm">Phòng CSGT TP.HCM</SelectItem>
            <SelectItem value="danang">Phòng CSGT Đà Nẵng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Tên đăng nhập</Label>
          <Input id="username" placeholder="Nhập tên đăng nhập" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu tạm thời</Label>
          <Input id="password" type="password" placeholder="Nhập mật khẩu" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
          Hủy
        </Button>
        <Button onClick={() => setIsCreateDialogOpen(false)}>Tạo tài khoản</Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý cán bộ</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
            <CreateOfficerForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="officers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="officers" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Danh sách cán bộ
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Hiệu suất làm việc
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
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

        <TabsContent value="officers" className="space-y-4">
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
                      <p className="text-sm text-muted-foreground">
                        {officer.position} • {officer.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(officer.status)}
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <p className="font-medium">{officer.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Điện thoại:</span>
                      <p className="font-medium">{officer.phone}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Phòng ban:</span>
                      <p className="font-medium">{officer.department}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Ngày vào làm:</span>
                      <p className="font-medium">{officer.joinDate}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Đăng nhập cuối:</span>
                      <p className="font-medium">{officer.lastLogin}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Đang xử lý:</span>
                      <p className="font-medium text-warning">{officer.assignedCases} vụ</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Đã hoàn thành:</span>
                      <p className="font-medium text-success">{officer.completedCases} vụ</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Phân quyền
                  </Button>
                  <Button variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-2" />
                    Lịch sử hoạt động
                  </Button>
                  {officer.status === "active" && (
                    <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Vô hiệu hóa
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top cán bộ hiệu suất cao</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {officers
                    .sort((a, b) => b.completedCases - a.completedCases)
                    .slice(0, 3)
                    .map((officer, index) => (
                      <div
                        key={officer.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? "bg-yellow-500 text-white"
                                : index === 1
                                  ? "bg-gray-400 text-white"
                                  : "bg-orange-600 text-white"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{officer.name}</p>
                            <p className="text-sm text-muted-foreground">{officer.position}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-success">{officer.completedCases}</p>
                          <p className="text-sm text-muted-foreground">vụ hoàn thành</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thống kê tổng quan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 border border-border rounded-lg">
                    <p className="text-2xl font-bold text-primary">{officers.length}</p>
                    <p className="text-sm text-muted-foreground">Tổng cán bộ</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <p className="text-2xl font-bold text-success">
                      {officers.filter((o) => o.status === "active").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tỷ lệ hoạt động</span>
                    <span className="font-medium">
                      {Math.round((officers.filter((o) => o.status === "active").length / officers.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full"
                      style={{
                        width: `${(officers.filter((o) => o.status === "active").length / officers.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold text-warning">
                        {officers.reduce((sum, o) => sum + o.assignedCases, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Đang xử lý</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-success">
                        {officers.reduce((sum, o) => sum + o.completedCases, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
