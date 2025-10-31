// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
console.log('[API] Using base URL:', API_BASE_URL)

// ----------------------------
// 🔹 Types
// ----------------------------
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface LoginRequest {
  username_or_email: string
  password: string
  identification_number?: string // required only for citizen
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface Violation {
  id: string
  type: string
  location: string
  time: string
  date?: string
  license_plate: string
  status: string
  fine?: number
  evidence?: string
  description?: string
}

export interface ViolationReport {
  type: string
  location: string
  time: string
  date: string
  license_plate?: string
  description: string
  evidence?: File
}

// ----------------------------
// 🔹 Error class
// ----------------------------
class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ----------------------------
// 🔹 Helper functions
// ----------------------------
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status,
      errorData.detail || errorData.message || 'An error occurred',
      errorData
    )
  }
  return response.json()
}

// ----------------------------
// 🔹 API Client
// ----------------------------
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getAuthToken()

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    // ✅ Chỉ set Content-Type nếu không phải FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = { ...options, headers }

    try {
      const response = await fetch(url, config)
      return handleResponse<T>(response)
    } catch (error) {
      console.error('❌ API Request failed:', url, error)
      if (error instanceof ApiError) throw error
      throw new ApiError(0, 'Network error or server unavailable')
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = getAuthToken()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    return handleResponse<T>(response)
  }
}

// ----------------------------
// 🔹 Create API instance
// ----------------------------
const apiClient = new ApiClient(API_BASE_URL)

// ----------------------------
// 🔹 Auth API
// ----------------------------
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // ✅ Gửi JSON thay vì FormData
    const response = await apiClient.post<LoginResponse>(
      '/api/v1/login',
      credentials
    )

    // ✅ Lưu token rồi lấy thông tin người dùng từ /me
    if (typeof window !== 'undefined' && response.access_token) {
      localStorage.setItem('access_token', response.access_token)
      try {
        const me = await apiClient.get('/api/v1/me')
        localStorage.setItem('user', JSON.stringify(me))
      } catch {
        // Nếu /me lỗi, vẫn tiếp tục với token đã lưu
      }
    }

    return response
  },

  register: async (data: {
    username: string
    email: string
    password: string
    full_name: string
    phone_number?: string
    identification_number: string
  }): Promise<{ message: string; user_id: number }> => {
    // ✅ Thêm dấu "/" ở đầu endpoint
    return apiClient.post<{ message: string; user_id: number }>(
      '/api/v1/register',
      data
    )
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }
  },

  getCurrentUser: () => {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('access_token')
  },
}

// ----------------------------
// 🔹 Violations API
// ----------------------------
export const violationsApi = {
  getAll: async (params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{ violations: Violation[]; total: number }> => {
    const limit = params?.limit ?? 50
    const page = params?.page ?? 1
    const skip = (page - 1) * limit
    const queryParams = new URLSearchParams()
    queryParams.append('skip', skip.toString())
    queryParams.append('limit', limit.toString())
    if (params?.status) queryParams.append('status', params.status)

    const endpoint = `/api/v1/violations${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiClient.get(endpoint)
  },

  getById: async (id: string): Promise<Violation> => {
    return apiClient.get<Violation>(`/api/v1/violations/${id}`)
  },

  lookupByLicensePlate: async (
    licensePlate: string
  ): Promise<Violation[]> => {
    const qp = new URLSearchParams({ license_plate: licensePlate })
    return apiClient.get<Violation[]>(`/api/v1/violations?${qp.toString()}`)
  },

  createReport: async (
    report: ViolationReport
  ): Promise<{ id: string; message: string }> => {
    const formData = new FormData()
    formData.append('type', report.type)
    formData.append('location', report.location)
    formData.append('time', report.time)
    formData.append('date', report.date)
    if (report.license_plate) formData.append('license_plate', report.license_plate)
    formData.append('description', report.description)
    if (report.evidence) formData.append('evidence', report.evidence)

    // NOTE: Backend has no explicit citizen violation report endpoint.
    // Consider wiring to complaints or denunciations when available.
    return apiClient.postFormData(`/api/v1/complaints`, formData)
  },

  updateStatus: async (id: string, status: string): Promise<Violation> => {
    // Backend exposes officer review endpoint instead of generic status update
    return apiClient.post<Violation>(`/api/v1/officer/violations/${id}/review`, { action: status })
  },
}

// ----------------------------
// 🔹 Citizen API
// ----------------------------
export const citizenApi = {
  getMyViolations: async (): Promise<Violation[]> => {
    return apiClient.get<Violation[]>('/api/v1/citizen/my-violations')
  },

  getMyReports: async (): Promise<unknown[]> => {
    // Map to complaints list until specific reports endpoint exists
    return apiClient.get<unknown[]>('/api/v1/complaints')
  },

  updateProfile: async (data: {
    email?: string
    phone?: string
    address?: string
  }): Promise<unknown> => {
    // No dedicated profile update endpoint in backend
    return apiClient.put('/api/v1/me', data as unknown)
  },
}

export const officerApi = {
  getViolations: async (params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{ violations: Violation[]; total: number }> => {
    const limit = params?.limit ?? 50
    const page = params?.page ?? 1
    const skip = (page - 1) * limit
    const queryParams = new URLSearchParams()
    queryParams.append('skip', skip.toString())
    queryParams.append('limit', limit.toString())
    const endpoint = `/api/v1/officer/violations/review-queue${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiClient.get(endpoint)
  },

  processViolation: async (
    id: string,
    action: 'approve' | 'reject',
    notes?: string
  ): Promise<Violation> => {
    return apiClient.post<Violation>(`/api/v1/officer/violations/${id}/review`, {
      action,
      notes,
    })
  },
}

export const adminApi = {
  getStatistics: async (): Promise<unknown> => {
    return apiClient.get('/api/v1/admin/dashboard/stats')
  },

  getCameras: async (): Promise<unknown[]> => {
    // Not available in backend; placeholder to avoid runtime errors
    return [] as unknown as unknown[]
  },

  getOfficers: async (): Promise<unknown[]> => {
    return apiClient.get<unknown[]>('/api/v1/admin/users?role=officer')
  },

  createOfficer: async (data: {
    username: string
    email: string
    password: string
  }): Promise<unknown> => {
    return apiClient.post('/api/v1/admin/users/officers', data)
  },
}

export { ApiError }
export default apiClient
