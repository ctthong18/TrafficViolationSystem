"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Eye, Clock, CheckCircle, XCircle, AlertCircle, Search } from "lucide-react"
import { useDenunciations, Denunciation } from "@/hooks/useDenuciation"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface DenunciationListProps {
  showActions?: boolean
  onViewDetail?: (denunciation: Denunciation) => void
}

export function DenunciationList({ showActions = true, onViewDetail }: DenunciationListProps) {
  const { denunciations, loading, error, fetchDenunciations } = useDenunciations()

  useEffect(() => {
    fetchDenunciations()
  }, [])

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

  const getSeverityBadge = (severity: string) => {
    const severityConfig: Record<string, { label: string; className: string }> = {
      low: { label: "Thấp", className: "bg-gray-100 text-gray-800" },
      medium: { label: "Trung bình", className: "bg-blue-100 text-blue-800" },
      high: { label: "Cao", className: "bg-orange-100 text-orange-800" },
      critical: { label: "Nghiêm trọng", className: "bg-red-100 text-red-800" },
    }

    const config = severityConfig[severity] || severityConfig.medium

    return (
      <Badge className={config.className}>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải danh sách tố cáo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (denunciations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chưa có tố cáo nào</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {denunciations.map((denunciation) => (
        <Card key={denunciation.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{denunciation.title}</CardTitle>
                  {getStatusBadge(denunciation.status)}
                  {denunciation.severity_level && getSeverityBadge(denunciation.severity_level)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {denunciation.denunciation_code || `TC-${denunciation.id}`}
                  </span>
                  <span>•</span>
                  <span>{getDenunciationTypeLabel(denunciation.type)}</span>
                  <span>•</span>
                  <span>
                    {format(new Date(denunciation.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {denunciation.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                {denunciation.location && (
                  <span className="text-muted-foreground">
                    Địa điểm: {denunciation.location}
                  </span>
                )}
                {denunciation.is_anonymous && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Ẩn danh
                  </Badge>
                )}
                {denunciation.reporter && !denunciation.is_anonymous && (
                  <span className="text-muted-foreground">
                    Người tố cáo: {denunciation.reporter}
                  </span>
                )}
              </div>

              {showActions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetail?.(denunciation)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Xem chi tiết
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
