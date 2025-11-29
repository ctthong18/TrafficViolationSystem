"use client"
import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Car, Loader2 } from "lucide-react"
import { useVehicles } from "@/hooks/useVehicles"
import { useToast } from "@/hooks/use-toast"

interface Vehicle {
  id: number
  licensePlate: string
  type: string
  brand?: string
  model?: string
  year?: string
  color?: string
  status: "active" | "inactive"
}

interface Props {
  vehicles: Vehicle[]
  setVehicles: (v: Vehicle[]) => void
}

export function VehicleList({ vehicles, setVehicles }: Props) {
  const [isAdding, setIsAdding] = useState(false)
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({})
  const [submitting, setSubmitting] = useState(false)
  const { createVehicle, deleteVehicle } = useVehicles()
  const { toast } = useToast()

  // Ensure vehicles is always an array
  const safeVehicles = Array.isArray(vehicles) ? vehicles : []

  const handleAdd = async () => {
    if (!newVehicle.licensePlate || !newVehicle.type) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập biển số và loại xe",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    try {
      // Get current user info for owner details
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      
      if (!user) {
        throw new Error("Không tìm thấy thông tin người dùng")
      }

      // Call API to create vehicle
      const createdVehicle = await createVehicle({
        license_plate: newVehicle.licensePlate,
        vehicle_type: newVehicle.type,
        vehicle_color: newVehicle.color || '',
        vehicle_brand: newVehicle.brand || '',
        owner_name: user.full_name || user.username,
        owner_identification: user.identification_number || ''
      })

      // Update local state with the created vehicle
      const mappedVehicle: Vehicle = {
        id: createdVehicle.id,
        licensePlate: createdVehicle.license_plate,
        type: createdVehicle.vehicle_type,
        brand: createdVehicle.vehicle_brand,
        model: newVehicle.model,
        year: newVehicle.year,
        color: createdVehicle.vehicle_color,
        status: "active"
      }
      
      setVehicles([...safeVehicles, mappedVehicle])
      setNewVehicle({})
      setIsAdding(false)
      
      toast({
        title: "Thành công",
        description: "Đã thêm phương tiện mới"
      })
    } catch (err: any) {
      console.error('Failed to create vehicle:', err)
      toast({
        title: "Lỗi",
        description: err.message || "Không thể thêm phương tiện",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (id: number) => {
    try {
      await deleteVehicle(id)
      setVehicles(safeVehicles.filter((v) => v.id !== id))
      toast({
        title: "Thành công",
        description: "Đã xóa phương tiện"
      })
    } catch (err: any) {
      console.error('Failed to delete vehicle:', err)
      toast({
        title: "Lỗi",
        description: err.message || "Không thể xóa phương tiện",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Danh sách phương tiện</h3>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm phương tiện
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Thêm phương tiện mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Biển số *</Label>
                <Input
                  value={newVehicle.licensePlate || ""}
                  onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                  placeholder="VD: 30A-12345"
                />
              </div>
              <div className="space-y-2">
                <Label>Loại xe *</Label>
                <Input
                  value={newVehicle.type || ""}
                  onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                  placeholder="VD: Ô tô, Xe máy"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Hãng xe</Label>
                <Input
                  value={newVehicle.brand || ""}
                  onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                  placeholder="VD: Toyota"
                />
              </div>
              <div className="space-y-2">
                <Label>Dòng xe</Label>
                <Input
                  value={newVehicle.model || ""}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  placeholder="VD: Vios"
                />
              </div>
              <div className="space-y-2">
                <Label>Năm sản xuất</Label>
                <Input
                  value={newVehicle.year || ""}
                  onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                  placeholder="VD: 2020"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Màu sắc</Label>
              <Input
                value={newVehicle.color || ""}
                onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                placeholder="VD: Trắng"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdding(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button onClick={handleAdd} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {safeVehicles.map((v) => (
        <Card key={v.id}>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" /> {v.licensePlate}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={v.status === "active" ? "bg-success text-success-foreground" : "bg-muted"}>
                {v.status === "active" ? "Hoạt động" : "Không hoạt động"}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => handleRemove(v.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <span className="text-sm text-muted-foreground">Loại xe:</span>
                <p className="font-medium">{v.type}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Hãng xe:</span>
                <p className="font-medium">{v.brand}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Dòng xe:</span>
                <p className="font-medium">{v.model}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Năm sản xuất:</span>
                <p className="font-medium">{v.year}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Màu sắc:</span>
                <p className="font-medium">{v.color}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {safeVehicles.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chưa có phương tiện nào được đăng ký</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
