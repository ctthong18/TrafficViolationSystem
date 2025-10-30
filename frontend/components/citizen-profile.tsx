"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Car, Edit, Save, X, Plus, Trash2 } from "lucide-react"

export function CitizenProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: "Nguyễn Văn C",
    email: "nguyenvanc@email.com",
    phone: "0123456789",
    address: "123 Phố ABC, Quận XYZ, Hà Nội",
    idNumber: "001234567890",
    dateOfBirth: "1990-01-15",
  })

  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      licensePlate: "30A-12345",
      type: "Ô tô",
      brand: "Toyota",
      model: "Vios",
      year: "2020",
      color: "Trắng",
      status: "active",
    },
    {
      id: 2,
      licensePlate: "30F-67890",
      type: "Xe máy",
      brand: "Honda",
      model: "Wave",
      year: "2019",
      color: "Đỏ",
      status: "active",
    },
  ])

  const [newVehicle, setNewVehicle] = useState({
    licensePlate: "",
    type: "",
    brand: "",
    model: "",
    year: "",
    color: "",
  })

  const [isAddingVehicle, setIsAddingVehicle] = useState(false)

  const handleSaveProfile = () => {
    // Handle save profile logic
    setIsEditing(false)
    // Show success message
  }

  const handleAddVehicle = () => {
    if (newVehicle.licensePlate && newVehicle.type) {
      setVehicles([
        ...vehicles,
        {
          ...newVehicle,
          id: vehicles.length + 1,
          status: "active",
        },
      ])
      setNewVehicle({
        licensePlate: "",
        type: "",
        brand: "",
        model: "",
        year: "",
        color: "",
      })
      setIsAddingVehicle(false)
    }
  }

  const handleRemoveVehicle = (id: number) => {
    setVehicles(vehicles.filter((v) => v.id !== id))
  }

  const violationHistory = [
    {
      date: "15/12/2024",
      type: "Vượt đèn đỏ",
      licensePlate: "30A-12345",
      fine: "1,000,000 VNĐ",
      status: "unpaid",
    },
    {
      date: "10/12/2024",
      type: "Đỗ xe sai quy định",
      licensePlate: "30A-12345",
      fine: "300,000 VNĐ",
      status: "paid",
    },
    {
      date: "05/11/2024",
      type: "Quá tốc độ",
      licensePlate: "30F-67890",
      fine: "800,000 VNĐ",
      status: "paid",
    },
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Phương tiện ({vehicles.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Lịch sử vi phạm
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
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
                    <Button onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, fullName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">Số CCCD/CMND</Label>
                  <Input
                    id="idNumber"
                    value={profileData.idNumber}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, idNumber: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, address: e.target.value }))}
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
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Danh sách phương tiện</h3>
            <Button onClick={() => setIsAddingVehicle(true)} disabled={isAddingVehicle}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm phương tiện
            </Button>
          </div>

          {isAddingVehicle && (
            <Card>
              <CardHeader>
                <CardTitle>Thêm phương tiện mới</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newLicensePlate">Biển số *</Label>
                    <Input
                      id="newLicensePlate"
                      placeholder="VD: 30A-12345"
                      value={newVehicle.licensePlate}
                      onChange={(e) => setNewVehicle((prev) => ({ ...prev, licensePlate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newType">Loại xe *</Label>
                    <Input
                      id="newType"
                      placeholder="VD: Ô tô, Xe máy"
                      value={newVehicle.type}
                      onChange={(e) => setNewVehicle((prev) => ({ ...prev, type: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="newBrand">Hãng xe</Label>
                    <Input
                      id="newBrand"
                      placeholder="VD: Toyota, Honda"
                      value={newVehicle.brand}
                      onChange={(e) => setNewVehicle((prev) => ({ ...prev, brand: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newModel">Dòng xe</Label>
                    <Input
                      id="newModel"
                      placeholder="VD: Vios, Wave"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle((prev) => ({ ...prev, model: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newYear">Năm sản xuất</Label>
                    <Input
                      id="newYear"
                      placeholder="VD: 2020"
                      value={newVehicle.year}
                      onChange={(e) => setNewVehicle((prev) => ({ ...prev, year: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newColor">Màu sắc</Label>
                  <Input
                    id="newColor"
                    placeholder="VD: Trắng, Đỏ"
                    value={newVehicle.color}
                    onChange={(e) => setNewVehicle((prev) => ({ ...prev, color: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingVehicle(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleAddVehicle}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    {vehicle.licensePlate}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-success text-success-foreground">Hoạt động</Badge>
                    <Button variant="outline" size="sm" onClick={() => handleRemoveVehicle(vehicle.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Loại xe:</span>
                    <p className="font-medium">{vehicle.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Hãng xe:</span>
                    <p className="font-medium">{vehicle.brand}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Dòng xe:</span>
                    <p className="font-medium">{vehicle.model}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Năm sản xuất:</span>
                    <p className="font-medium">{vehicle.year}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Màu sắc:</span>
                    <p className="font-medium">{vehicle.color}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {vehicles.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Chưa có phương tiện nào được đăng ký</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử vi phạm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {violationHistory.map((violation, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{violation.type}</span>
                        <Badge
                          className={
                            violation.status === "paid"
                              ? "bg-success text-success-foreground"
                              : "bg-warning text-warning-foreground"
                          }
                        >
                          {violation.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Biển số: {violation.licensePlate}</p>
                      <p className="text-xs text-muted-foreground">Ngày vi phạm: {violation.date}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          violation.status === "paid" ? "text-success" : "text-destructive"
                        }`}
                      >
                        {violation.fine}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {violationHistory.length === 0 && (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Không có lịch sử vi phạm</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
