"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DrivingLicenseCreate } from '@/lib/api'

interface AddDrivingLicenseDialogProps {
  children: React.ReactNode
  onAdd: (data: DrivingLicenseCreate) => Promise<any>
}

export function AddDrivingLicenseDialog({ children, onAdd }: AddDrivingLicenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<DrivingLicenseCreate>({
    license_number: '',
    license_class: '',
    full_name: '',
    date_of_birth: '',
    nationality: 'Việt Nam',
    address: '',
    issue_date: '',
    expiry_date: '',
    issue_place: ''
  })

  const licenseClasses = [
    { value: 'a1', label: 'A1 - Xe máy < 175cc' },
    { value: 'a2', label: 'A2 - Xe máy > 175cc' },
    { value: 'a3', label: 'A3 - Xe máy 3 bánh' },
    { value: 'a4', label: 'A4 - Xe máy kéo rơ moóc' },
    { value: 'b1', label: 'B1 - Ô tô số tự động' },
    { value: 'b2', label: 'B2 - Ô tô < 9 chỗ' },
    { value: 'c', label: 'C - Ô tô tải' },
    { value: 'd', label: 'D - Ô tô khách' },
    { value: 'e', label: 'E - Ô tô kéo rơ moóc' },
    { value: 'f', label: 'F - Tất cả các hạng' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.license_number || !formData.license_class || !formData.full_name || 
        !formData.date_of_birth || !formData.issue_date || !formData.expiry_date) {
      return
    }

    try {
      setLoading(true)
      await onAdd(formData)
      setOpen(false)
      setFormData({
        license_number: '',
        license_class: '',
        full_name: '',
        date_of_birth: '',
        nationality: 'Việt Nam',
        address: '',
        issue_date: '',
        expiry_date: '',
        issue_place: ''
      })
    } catch (error) {
      console.error('Failed to add driving license:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm bằng lái xe</DialogTitle>
          <DialogDescription>
            Nhập thông tin bằng lái xe của bạn
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="license_number">Số bằng lái *</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                placeholder="VD: 123456789"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="license_class">Hạng bằng lái *</Label>
              <Select
                value={formData.license_class}
                onValueChange={(value) => setFormData(prev => ({ ...prev, license_class: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hạng bằng lái" />
                </SelectTrigger>
                <SelectContent>
                  {licenseClasses.map((cls) => (
                    <SelectItem key={cls.value} value={cls.value}>
                      {cls.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="full_name">Họ và tên *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="VD: Nguyễn Văn A"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Ngày sinh *</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nationality">Quốc tịch</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                placeholder="VD: Việt Nam"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue_date">Ngày cấp *</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Ngày hết hạn *</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issue_place">Nơi cấp</Label>
            <Input
              id="issue_place"
              value={formData.issue_place}
              onChange={(e) => setFormData(prev => ({ ...prev, issue_place: e.target.value }))}
              placeholder="VD: Sở GTVT TP.HCM"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang thêm...' : 'Thêm bằng lái'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
