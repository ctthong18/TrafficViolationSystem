const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface LoginRequest {
  username: string
  password: string
  role?: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: {
    id: number
    username: string
    role: string
    email?: string
  }
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

// API Error Handler
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

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

// Helper function to handle response
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

// API Client
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
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      return handleResponse<T>(response)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
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
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    return handleResponse<T>(response)
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL)

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    
    const response = await apiClient.postFormData<LoginResponse>(
      '/api/auth/login',
      formData
    )
    
    // Store token
    if (typeof window !== 'undefined' && response.access_token) {
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
    }
    
    return response
  },

  register: async (data: {
    username: string
    email: string
    password: string
    full_name: string
    phone_number?: string
  }): Promise<{ message: string; user_id: number }> => {
    const response = await apiClient.post<{ message: string; user_id: number }>(
      'api/auth/register',
      data
    )
    return response
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

// Violations API
export const violationsApi = {
  getAll: async (params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{ violations: Violation[]; total: number }> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    
    const endpoint = `/api/violations${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiClient.get(endpoint)
  },

  getById: async (id: string): Promise<Violation> => {
    return apiClient.get<Violation>(`/api/violations/${id}`)
  },

  lookupByLicensePlate: async (
    licensePlate: string
  ): Promise<Violation[]> => {
    return apiClient.get<Violation[]>(
      `/api/citizen/violations/lookup?license_plate=${licensePlate}`
    )
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

    return apiClient.postFormData(`/api/citizen/violations/report`, formData)
  },

  updateStatus: async (
    id: string,
    status: string
  ): Promise<Violation> => {
    return apiClient.put<Violation>(`/api/violations/${id}/status`, { status })
  },
}

// Citizen API
export const citizenApi = {
  getMyViolations: async (): Promise<Violation[]> => {
    return apiClient.get<Violation[]>('/api/citizen/violations')
  },

  getMyReports: async (): Promise<unknown[]> => {
    return apiClient.get<unknown[]>('/api/citizen/reports')
  },

  updateProfile: async (data: {
    email?: string
    phone?: string
    address?: string
  }): Promise<unknown> => {
    return apiClient.put('/api/citizen/profile', data)
  },
}

// Officer API
export const officerApi = {
  getViolations: async (params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{ violations: Violation[]; total: number }> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    
    const endpoint = `/api/officer/violations${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiClient.get(endpoint)
  },

  processViolation: async (
    id: string,
    action: 'approve' | 'reject',
    notes?: string
  ): Promise<Violation> => {
    return apiClient.post<Violation>(`/api/officer/violations/${id}/process`, {
      action,
      notes,
    })
  },
}

// Authority/Admin API
export const adminApi = {
  getStatistics: async (): Promise<unknown> => {
    return apiClient.get('/api/admin/statistics')
  },

  getCameras: async (): Promise<unknown[]> => {
    return apiClient.get<unknown[]>('/api/admin/cameras')
  },

  getOfficers: async (): Promise<unknown[]> => {
    return apiClient.get<unknown[]>('/api/admin/officers')
  },

  createOfficer: async (data: {
    username: string
    email: string
    password: string
  }): Promise<unknown> => {
    return apiClient.post('/api/admin/officers', data)
  },
}

export { ApiError }
export default apiClient

