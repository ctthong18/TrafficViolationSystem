import { useState } from 'react'

// Complaint types
export interface Complaint {
  id: number
  complaint_code: string
  title: string
  description: string
  complaint_type: string
  status: string
  priority: string
  complainant_name?: string
  complainant_phone?: string
  complainant_email?: string
  violation_id?: number
  vehicle_id?: number
  assigned_officer_id?: number
  assigned_at?: string
  resolved_at?: string
  user_rating?: number
  user_feedback?: string
  created_at: string
  updated_at: string
}

export interface ComplaintCreate {
  title: string
  description: string
  complaint_type: string
  desired_resolution?: string
  is_anonymous?: boolean
  violation_id?: number
  vehicle_id?: number
  evidence_urls?: string[]
}

export function useComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComplaints = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/api/v1/complaints', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch complaints')
      }
      
      const data = await response.json()
      setComplaints(data.complaints || [])
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách khiếu nại')
      console.error('Error fetching complaints:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyComplaints = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/api/v1/complaints/my-complaints', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch my complaints')
      }
      
      const data = await response.json()
      setComplaints(data.complaints || [])
    } catch (err: any) {
      setError(err.message || 'Không thể tải khiếu nại của bạn')
      console.error('Error fetching my complaints:', err)
    } finally {
      setLoading(false)
    }
  }

  const createComplaint = async (payload: ComplaintCreate) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/api/v1/complaints', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create complaint')
      }
      
      const data = await response.json()
      setComplaints(prev => [data, ...prev])
      return data
    } catch (err: any) {
      throw new Error(err.message || 'Tạo khiếu nại thất bại')
    }
  }

  const rateComplaint = async (complaintId: number, rating: number, feedback?: string) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`http://localhost:8000/api/v1/complaints/${complaintId}/rate?rating=${rating}${feedback ? `&feedback=${encodeURIComponent(feedback)}` : ''}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to rate complaint')
      }
      
      const data = await response.json()
      setComplaints(prev => prev.map(c => c.id === complaintId ? data : c))
      return data
    } catch (err: any) {
      throw new Error(err.message || 'Đánh giá thất bại')
    }
  }

  return {
    complaints,
    loading,
    error,
    fetchComplaints,
    fetchMyComplaints,
    createComplaint,
    rateComplaint,
  }
}
