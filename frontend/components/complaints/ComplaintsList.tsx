"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Calendar, User, Eye } from "lucide-react"
import { useComplaints } from "@/hooks/useComplaints"

interface ComplaintsListProps {
  filter?: string
}

export function ComplaintsList({ filter }: ComplaintsListProps) {
  const { 
    complaints, 
    loading, 
    error, 
    fetchComplaints, 
    resolveComplaint, 
    rejectComplaint,
    updateComplaintStatus 
  } = useComplaints()

  useEffect(() => {
    fetchComplaints(filter)
  }, [filter, fetchComplaints])
  
  const handleResolve = async (id: string) => {
    try {
      const resolution = prompt("Nhập nội dung giải quyết:")
      if (!resolution) return
      
      await resolveComplaint(id, resolution)
      // Refetch to update the list
      await fetchComplaints(filter)
    } catch (err: any) {
      alert(err.message)
    }
  }
  
  const handleReject = async (id: string) => {
    try {
      const reason = prompt("Nhập lý do từ chối:")
      if (!reason) return
      
      await rejectComplaint(id, reason)
      // Refetch to update the list
      await fetchComplaints(filter)
    } catch (err: any) {
      alert(err.message)
    }
  }
  
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateComplaintStatus(id, newStatus as any)
      // Refetch to update the list
      await fetchComplaints(filter)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary">Mới</Badge>
      case "processing":
        return <Badge variant="default">Đang xử lý</Badge>
      case "resolved":
        return <Badge className="bg-green-600">Đã giải quyết</Badge>
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Cao</Badge>
      case "medium":
        return <Badge variant="default">Trung bình</Badge>
      case "low":
        return <Badge variant="secondary">Thấp</Badge>
      default:
        return null
    }
  }

  if (loading) return <p>Đang tải khiếu nại...</p>
  if (error) return <p className="text-destructive">{error}</p>

  if (complaints.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Chưa có khiếu nại nào</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <Card key={complaint.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{complaint.title}</h3>
                  {getStatusBadge(complaint.status)}
                  {getPriorityBadge(complaint.priority)}
                </div>

                <p className="text-sm text-muted-foreground">{complaint.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    {complaint.complainant_name || "Ẩn danh"}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(complaint.created_at).toLocaleString("vi-VN")}
                  </div>
                </div>

                {complaint.violation_id && (
                  <div className="text-xs text-muted-foreground">
                    Liên quan đến vi phạm: #{complaint.violation_id}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {complaint.status === "new" && (
                  <>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => handleStatusChange(complaint.id, "processing")}
                    >
                      Xử lý
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleReject(complaint.id)}
                    >
                      Từ chối
                    </Button>
                  </>
                )}
                
                {complaint.status === "processing" && (
                  <>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleResolve(complaint.id)}
                    >
                      Giải quyết
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleReject(complaint.id)}
                    >
                      Từ chối
                    </Button>
                  </>
                )}
                
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Chi tiết
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
