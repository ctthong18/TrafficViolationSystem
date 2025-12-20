"use client"

import { useState, useCallback } from "react"

export interface Complaint {
  id: string
  complaint_code: string
  title: string
  description: string
  complainant_name?: string
  status: "new" | "processing" | "resolved" | "rejected"
  priority: "low" | "medium" | "high"
  created_at: string
  updated_at: string
  violation_id?: string
}

export function useComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComplaints = useCallback(async (filter?: string) => {
    setLoading(true)
    setError(null)
    try {
      // TODO: Replace with actual API endpoint when available
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/complaints${filter ? `?status=${filter}` : ''}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      
      if (!response.ok) {
        // API chưa có, không hiển thị lỗi
        console.warn("Complaints API not available yet")
        setComplaints([])
        return
      }
      
      const data = await response.json()
      setComplaints(data.complaints || [])
    } catch (err: any) {
      // Không hiển thị lỗi khi API chưa có
      console.warn("Complaints API not available:", err.message)
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createComplaint = useCallback(async (complaint: Partial<Complaint>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(complaint)
      })
      
      if (!response.ok) throw new Error("Không thể tạo khiếu nại")
      
      const data = await response.json()
      setComplaints(prev => [data, ...prev])
      return data
    } catch (err: any) {
      throw new Error(err.message || "Tạo khiếu nại thất bại")
    }
  }, [])

  const updateComplaintStatus = useCallback(async (id: string, status: Complaint['status']) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/complaints/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) throw new Error("Không thể cập nhật trạng thái")
      
      const updatedComplaint = await response.json()
      
      // Update local state - remove from current list since status changed
      setComplaints(prev => prev.filter(c => c.id !== id))
      
      return updatedComplaint
    } catch (err: any) {
      throw new Error(err.message || "Cập nhật trạng thái thất bại")
    }
  }, [])
  
  const resolveComplaint = useCallback(async (id: string, resolution: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/complaints/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ resolution })
      })
      
      if (!response.ok) throw new Error("Không thể giải quyết khiếu nại")
      
      const resolvedComplaint = await response.json()
      
      // Remove from current list since it's now resolved
      setComplaints(prev => prev.filter(c => c.id !== id))
      
      return resolvedComplaint
    } catch (err: any) {
      throw new Error(err.message || "Giải quyết khiếu nại thất bại")
    }
  }, [])
  
  const rejectComplaint = useCallback(async (id: string, reason: string) => {
    try {
      // Update status to rejected with reason
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/complaints/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
          status: 'rejected',
          resolution: reason
        })
      })
      
      if (!response.ok) throw new Error("Không thể từ chối khiếu nại")
      
      const rejectedComplaint = await response.json()
      
      // Remove from current list since it's now rejected
      setComplaints(prev => prev.filter(c => c.id !== id))
      
      return rejectedComplaint
    } catch (err: any) {
      throw new Error(err.message || "Từ chối khiếu nại thất bại")
    }
  }, [])

  return {
    complaints,
    loading,
    error,
    fetchComplaints,
    createComplaint,
    updateComplaintStatus,
    resolveComplaint,
    rejectComplaint
  }
}
