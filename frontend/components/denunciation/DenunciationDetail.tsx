"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Shield, Clock, CheckCircle, XCircle, AlertCircle, 
  User, Calendar, Lock, Search 
} from "lucide-react"
import { Denunciation } from "@/hooks/useDenuciation"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface DenunciationDetailProps {
  denunciation: Denunciation
  onClose?: () => void
}

export function DenunciationDetail({ denunciation, onClose }: DenunciationDetailProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { label: "Chờ xử lý", variant: "secondary", icon: Clock },
      verifying: { label: "Đang xác minh", variant: "default", icon: Search },
      investigating: { label: "Đang điều tra", variant: "default", icon: AlertCircle },
      resolved: { label: "Đã giải quyết", variant: "outline", icon: CheckCircle },
      rejected: { label: "Từ chối", variant: "destructive", icon: XCircle },
      transferred: { label: "Đã chuyển", variant: "outline", icon: AlertCircle },
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getDenunciationTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      corruption: "Tham nhũng",
      abuse_of_power: "Lạm dụng quyền lực",
      violation_cover_up: "Che giấu vi phạm",
      fraud: "Gian lận",
      system_manipulation: "Thao túng hệ thống",
      other_illegal: "Hành vi bất hợp pháp khác",
    }
    return typeLabels[type] || type
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">{denunciation.title}</CardTitle>
                {getStatusBadge(denunciation.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {denunciation.denunciation_code || `TC-${denunciation.id}`}
                </span>
                <span>•</span>
                <span>{getDenunciationTypeLabel(denunciation.type)}</span>
              </div>
            </div>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Đóng
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cảnh báo bảo mật */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Thông tin được bảo mật:</p>
                <p>
                  Tố cáo này được xử lý theo quy trình bảo mật nghiêm ngặt. 
                  Chỉ cơ quan có thẩm quyền mới được tiếp cận thông tin chi tiết.
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin cơ bản */}
          <div>
            <h3 className="font-semibold mb-2">Mô tả chi tiết</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {denunciation.description}
            </p>
          </div>

          <Separator />

          {/* Thông tin thời gian */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span>Ngày tạo</span>
              </div>
              <p className="text-sm font-medium">
                {format(new Date(denunciation.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
              </p>
            </div>
            {denunciation.resolvedAt && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Ngày giải quyết</span>
                </div>
                <p className="text-sm font-medium">
                  {format(new Date(denunciation.resolvedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                </p>
              </div>
            )}
          </div>

          {/* Thông tin người tố cáo */}
          {denunciation.is_anonymous ? (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Tố cáo ẩn danh - Thông tin người tố cáo được bảo mật
              </p>
            </div>
          ) : denunciation.reporter && (
            <div>
              <h3 className="font-semibold mb-2">Thông tin người tố cáo</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Họ tên:</span>
                  <p className="font-medium">{denunciation.reporter}</p>
                </div>
              </div>
            </div>
          )}

          {/* Thông tin địa điểm */}
          {denunciation.location && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Địa điểm</h3>
                <p className="text-sm text-muted-foreground">{denunciation.location}</p>
              </div>
            </>
          )}

          {/* Mức độ nghiêm trọng */}
          {denunciation.severity_level && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Mức độ nghiêm trọng</h3>
                <Badge className={
                  denunciation.severity_level === "critical" ? "bg-red-100 text-red-800" :
                  denunciation.severity_level === "high" ? "bg-orange-100 text-orange-800" :
                  denunciation.severity_level === "medium" ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-800"
                }>
                  {denunciation.severity_level === "critical" ? "Nghiêm trọng" :
                   denunciation.severity_level === "high" ? "Cao" :
                   denunciation.severity_level === "medium" ? "Trung bình" :
                   "Thấp"}
                </Badge>
              </div>
            </>
          )}

          {/* Kết quả xử lý */}
          {denunciation.status === "resolved" && (
            <>
              <Separator />
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">Đã giải quyết</h3>
                    <p className="text-sm text-green-800">
                      Tố cáo đã được xử lý và giải quyết
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {denunciation.status === "rejected" && (
            <>
              <Separator />
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">Từ chối</h3>
                    <p className="text-sm text-red-800">
                      Tố cáo không được chấp nhận
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {denunciation.status === "investigating" && (
            <>
              <Separator />
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Search className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">Đang điều tra</h3>
                    <p className="text-sm text-blue-800">
                      Tố cáo đang được điều tra và xác minh. Bạn sẽ nhận được thông báo khi có kết quả.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
