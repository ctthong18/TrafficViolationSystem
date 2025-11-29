"use client"
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, CreditCard, Shield, AlertCircle } from 'lucide-react'
import { useDrivingLicense } from '@/hooks/useDrivingLicense'
import { AddDrivingLicenseDialog } from './AddDrivingLicenseDialog'
import { EditDrivingLicenseDialog } from './EditDrivingLicenseDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DrivingLicenseSection() {
  const { license, loading, createLicense, updateLicense, deleteLicense } = useDrivingLicense()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!license) return
    try {
      setIsDeleting(true)
      await deleteLicense(license.id)
    } catch (error) {
      console.error('Failed to delete license:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getLicenseClassLabel = (licenseClass: string) => {
    const labels: { [key: string]: string } = {
      'a1': 'A1 - Xe máy < 175cc',
      'a2': 'A2 - Xe máy > 175cc',
      'a3': 'A3 - Xe máy 3 bánh',
      'a4': 'A4 - Xe máy kéo rơ moóc',
      'b1': 'B1 - Ô tô số tự động',
      'b2': 'B2 - Ô tô < 9 chỗ',
      'c': 'C - Ô tô tải',
      'd': 'D - Ô tô khách',
      'e': 'E - Ô tô kéo rơ moóc',
      'f': 'F - Tất cả các hạng'
    }
    return labels[licenseClass.toLowerCase()] || licenseClass.toUpperCase()
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: 'default' | 'destructive' | 'secondary' } } = {
      'active': { label: 'Còn hiệu lực', variant: 'default' },
      'suspended': { label: 'Tạm giữ', variant: 'destructive' },
      'revoked': { label: 'Thu hồi', variant: 'destructive' },
      'expired': { label: 'Hết hạn', variant: 'secondary' }
    }
    const statusInfo = statusMap[status.toLowerCase()] || { label: status, variant: 'secondary' as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const isExpired = license ? new Date(license.expiry_date) < new Date() : false
  const isExpiringSoon = license ? new Date(license.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!license) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Chưa có thông tin bằng lái xe</p>
            <p className="text-sm text-gray-500 mb-4">Thêm bằng lái xe để quản lý thông tin của bạn</p>
            <AddDrivingLicenseDialog onAdd={createLicense}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm bằng lái xe
              </Button>
            </AddDrivingLicenseDialog>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Bằng lái xe số {license.license_number}
        </CardTitle>
        <div className="flex items-center gap-2">
          <EditDrivingLicenseDialog license={license} onUpdate={(data: any) => updateLicense(license.id, data)}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </EditDrivingLicenseDialog>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa bằng lái xe</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa thông tin bằng lái xe này? Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Đang xóa...' : 'Xóa'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Warning */}
        {(isExpired || isExpiringSoon || license.status !== 'active') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">Cảnh báo</p>
              <p className="text-sm text-yellow-700">
                {isExpired && 'Bằng lái đã hết hạn. Vui lòng gia hạn.'}
                {!isExpired && isExpiringSoon && 'Bằng lái sắp hết hạn trong 30 ngày tới.'}
                {license.status === 'suspended' && 'Bằng lái đang bị tạm giữ.'}
                {license.status === 'revoked' && 'Bằng lái đã bị thu hồi.'}
              </p>
            </div>
          </div>
        )}

        {/* License Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
              <p className="font-medium">{license.full_name}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Ngày sinh</p>
              <p className="font-medium">{new Date(license.date_of_birth).toLocaleDateString('vi-VN')}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Hạng bằng lái</p>
              <p className="font-medium">{getLicenseClassLabel(license.license_class)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
              {getStatusBadge(license.status)}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Ngày cấp</p>
              <p className="font-medium">{new Date(license.issue_date).toLocaleDateString('vi-VN')}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Ngày hết hạn</p>
              <div className="flex items-center gap-2">
                <p className="font-medium">{new Date(license.expiry_date).toLocaleDateString('vi-VN')}</p>
                {isExpired && <Badge variant="destructive" className="text-xs">Hết hạn</Badge>}
                {!isExpired && isExpiringSoon && <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Sắp hết hạn</Badge>}
              </div>
            </div>
            
            {license.issue_place && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Nơi cấp</p>
                <p className="font-medium">{license.issue_place}</p>
              </div>
            )}
            
            {license.address && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                <p className="font-medium">{license.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Points Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Điểm bằng lái
            </h3>
            <span className="text-2xl font-bold text-blue-600">{license.current_points}/{license.total_points}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full ${
                license.current_points >= 9 ? 'bg-green-500' : 
                license.current_points >= 6 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${(license.current_points / license.total_points) * 100}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <p className="text-gray-500">Tổng vi phạm</p>
              <p className="font-medium">{license.total_violations}</p>
            </div>
            <div>
              <p className="text-gray-500">Vi phạm nghiêm trọng</p>
              <p className="font-medium text-red-600">{license.serious_violations}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
