"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Eye, Star, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useComplaints, Complaint } from "@/hooks/useComplaints"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface ComplaintListProps {
  showActions?: boolean
  onViewDetail?: (complaint: Complaint) => void
}

export function ComplaintList({ showActions = true, onViewDetail }: ComplaintListProps) {
  const { complaints, loading, error, fetchMyComplaints } = useComplaints()

  useEffect(() => {
    fetchMyComplaints()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { label: "Chờ xử lý", variant: "secondary", icon: Clock },
      under_review: { label: "Đang xem xét", variant: "default", icon: AlertCircle },
      resolved: { label: "Đã giải quyết", variant: "outline", icon: CheckCircle },
      rejected: { label: "Từ chối", variant: "destructive", icon: XCircle },
      cancelled: { label: "Đã hủy", variant: "outline", icon: XCircle },
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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { label: string; className: string }> = {
      low: { label: "Thấp", className: "bg-gray-100 text-gray-800" },
      medium: { label: "Trung bình", className: "bg-blue-100 text-blue-800" },
      high: { label: "Cao", className: "bg-orange-100 text-orange-800" },
      urgent: { label: "Khẩn cấp", className: "bg-red-100 text-red-800" },
    }

    const config = priorityConfig[priority] || priorityConfig.medium

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getComplaintTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      violation_dispute: "Khiếu nại vi phạm",
      false_positive: "Báo cáo sai",
      missing_violation: "Vi phạm bị bỏ sót",
      officer_behavior: "Hành vi cán bộ",
      system_error: "Lỗi hệ thống",
      other: "Khác",
    }
    return typeLabels[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải danh sách khiếu nại...</p>
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

  if (complaints.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chưa có khiếu nại nào</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <Card key={complaint.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg">{complaint.title}</CardTitle>
                  {getStatusBadge(complaint.status)}
                  {getPriorityBadge(complaint.priority)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {complaint.complaint_code}
                  </span>
                  <span>•</span>
                  <span>{getComplaintTypeLabel(complaint.complaint_type)}</span>
                  <span>•</span>
                  <span>
                    {format(new Date(complaint.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {complaint.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                {complaint.violation_id && (
                  <span className="text-muted-foreground">
                    Vi phạm: #{complaint.violation_id}
                  </span>
                )}
                {complaint.resolved_at && (
                  <span className="text-muted-foreground">
                    Giải quyết: {format(new Date(complaint.resolved_at), "dd/MM/yyyy", { locale: vi })}
                  </span>
                )}
                {complaint.user_rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{complaint.user_rating}/5</span>
                  </div>
                )}
              </div>

              {showActions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetail?.(complaint)}
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
