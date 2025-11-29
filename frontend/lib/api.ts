// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
console.log('[API] Using base URL:', API_BASE_URL)

// 🔹 Types

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface User {
  id: number
  username: string
  email: string 
  role: "admin" | "officer" | "citizen"
  full_name: string
}

export interface LoginRequest {
  username_or_email: string
  password: string
  identification_number?: string // required only for citizen
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface Officer {
  id: number | string
  username: string
  full_name?: string
  email: string
  badge_number?: string
  position?: string
  department?: string
  phone_number?: string
  status?: string
  role?: string
}


export interface PaginatedResponse<T> {
  users: T[]
  total: number
  page: number
  size: number
}

// Video evidence info
export interface VideoEvidenceInfo {
  video_id: number
  cloudinary_url: string
  thumbnail_url?: string
  duration?: number
}

// Backend Violation Response
export interface ViolationResponse {
  id: number
  license_plate: string
  vehicle_type?: string
  vehicle_color?: string
  vehicle_brand?: string
  violation_type: string
  violation_description?: string
  location_name?: string
  latitude?: number
  longitude?: number
  camera_id?: string
  detected_at: string
  confidence_score: number
  status: string
  priority: string
  reviewed_by?: number
  reviewed_at?: string
  review_notes?: string
  evidence_images?: string[]
  evidence_gif?: string
  fine_amount?: number
  points_deducted?: number
  legal_reference?: string
  video_id?: number
  video_evidence?: VideoEvidenceInfo
  created_at: string
  updated_at: string
}

export interface ViolationListResponse {
  violations: ViolationResponse[]
  total: number
  page: number
  size: number
}

// Frontend Violation (mapped from backend)
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
  priority?: string
  detected_at?: string
  video_id?: number
  video_evidence?: VideoEvidenceInfo
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

// 🔹 Error class

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

// Helper functions

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorData: any = {}
    const contentType = response.headers.get('content-type')
    
    try {
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json()
      } else {
        const text = await response.text()
        errorData = { message: text || `HTTP ${response.status} ${response.statusText}` }
      }
    } catch (e) {
      errorData = { message: `HTTP ${response.status} ${response.statusText}` }
    }
    
    // Extract error message from various formats
    let errorMessage: string
    
    if (typeof errorData.detail === 'string') {
      errorMessage = errorData.detail
    } else if (Array.isArray(errorData.detail)) {
      // FastAPI validation errors: [{type, loc, msg, input}]
      const firstError = errorData.detail[0]
      errorMessage = firstError?.msg || JSON.stringify(errorData.detail)
    } else if (errorData.message) {
      errorMessage = errorData.message
    } else if (errorData.error) {
      errorMessage = errorData.error
    } else {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`
    }
    
    throw new ApiError(
      response.status,
      errorMessage,
      errorData
    )
  }
  
  try {
    return await response.json()
  } catch (e) {
    throw new ApiError(
      response.status,
      'Invalid JSON response from server',
      { originalError: e }
    )
  }
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
      ...(options.headers as Record<string, string>),
    }

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
      console.error('API Request failed:', url, error)
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

// Create API instance

const apiClient = new ApiClient(API_BASE_URL)

// Auth API

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/v1/login',
      credentials
    )

    if (typeof window !== 'undefined' && response.access_token) {
      localStorage.setItem('access_token', response.access_token)
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
      } else {
        // Fallback: fetch user info if not in response
        try {
          const me = await apiClient.get<User>('/v1/me')
          localStorage.setItem('user', JSON.stringify(me))
        } catch {
        }
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
    return apiClient.post<{ message: string; user_id: number }>(
      '/v1/register',
      data
    )
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? (JSON.parse(userStr) as User) : null
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('access_token')
  },
}

// Helper function to map backend violation to frontend format
const mapViolation = (v: ViolationResponse): Violation => {
  const detectedDate = new Date(v.detected_at)
  return {
    id: v.id.toString(),
    type: v.violation_type,
    location: v.location_name || '',
    time: detectedDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    date: detectedDate.toLocaleDateString('vi-VN'),
    license_plate: v.license_plate,
    status: v.status,
    fine: v.fine_amount ? Number(v.fine_amount) : undefined,
    evidence: v.evidence_images?.join(', ') || v.evidence_gif || undefined,
    description: v.violation_description || undefined,
    priority: v.priority,
    detected_at: v.detected_at,
  }
}

// Violations API
export const violationsApi = {
  getAll: async (params?: {
    page?: number
    limit?: number
    status?: string
    license_plate?: string
  }): Promise<{ violations: Violation[]; total: number; page: number; size: number }> => {
    const limit = params?.limit ?? 50
    const page = params?.page ?? 1
    const skip = (page - 1) * limit
    const queryParams = new URLSearchParams()
    queryParams.append('skip', skip.toString())
    queryParams.append('limit', limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.license_plate) queryParams.append('license_plate', params.license_plate)

    const endpoint = `/v1/violations${queryParams.toString() ? `?${queryParams}` : ''}`
    const response = await apiClient.get<ViolationListResponse>(endpoint)
    return {
      violations: response.violations.map(mapViolation),
      total: response.total,
      page: response.page,
      size: response.size,
    }
  },

  getById: async (id: string): Promise<Violation> => {
    const response = await apiClient.get<ViolationResponse>(`/v1/violations/${id}`)
    return mapViolation(response)
  },

  lookupByLicensePlate: async (
    licensePlate: string
  ): Promise<Violation[]> => {
    const response = await violationsApi.getAll({ license_plate: licensePlate, limit: 100 })
    return response.violations
  },

  getProcessed: async (params?: {
    page?: number
    limit?: number
  }): Promise<{ violations: Violation[]; total: number; page: number; size: number }> => {
    const limit = params?.limit ?? 50
    const page = params?.page ?? 1
    const skip = (page - 1) * limit
    const queryParams = new URLSearchParams()
    queryParams.append('skip', skip.toString())
    queryParams.append('limit', limit.toString())

    const endpoint = `/v1/violations/processed/list${queryParams.toString() ? `?${queryParams}` : ''}`
    const response = await apiClient.get<ViolationListResponse>(endpoint)
    return {
      violations: response.violations.map(mapViolation),
      total: response.total,
      page: response.page,
      size: response.size,
    }
  },

  createReport: async (
    report: ViolationReport | FormData
  ): Promise<{ id: string; message: string }> => {
    // If it's already FormData, use it directly
    if (report instanceof FormData) {
      return apiClient.postFormData(`/v1/complaints`, report)
    }
    
    // Otherwise, convert ViolationReport to FormData
    const formData = new FormData()
    formData.append('type', report.type)
    formData.append('location', report.location)
    formData.append('time', report.time)
    formData.append('date', report.date)
    if (report.license_plate) formData.append('license_plate', report.license_plate)
    formData.append('description', report.description)
    if (report.evidence) formData.append('evidence', report.evidence)

    return apiClient.postFormData(`/v1/complaints`, formData)
  },

  updateStatus: async (id: string, status: string): Promise<Violation> => {
    // Backend exposes officer review endpoint instead of generic status update
    const response = await apiClient.post<ViolationResponse>(`/v1/officer/violations/${id}/review`, { 
      action: status,
      notes: ''
    })
    return mapViolation(response)
  },
}

export const citizenApi = {
  getMyViolations: async (): Promise<Violation[]> => {
    const data = await apiClient.get<ViolationResponse[]>('/v1/citizen/my-violations')
    return data.map(mapViolation)
  },

  getMyReports: async (): Promise<unknown[]> => {
    const response = await apiClient.get<{ complaints: unknown[]; total: number; page: number; size: number }>('/v1/complaints')
    return response.complaints || []
  },

  updateProfile: async (data: {
    email?: string
    phone?: string
    address?: string
  }): Promise<unknown> => {
    return apiClient.put('/v1/me', data as unknown)
  },
}

export const officerApi = {
  getViolations: async (params?: {
    page?: number
    limit?: number
    priority?: string
  }): Promise<{ violations: Violation[]; total: number; page: number; size: number }> => {
    const limit = params?.limit ?? 50
    const page = params?.page ?? 1
    const skip = (page - 1) * limit
    const queryParams = new URLSearchParams()
    queryParams.append('skip', skip.toString())
    queryParams.append('limit', limit.toString())
    if (params?.priority) queryParams.append('priority', params.priority)
    
    const endpoint = `/v1/officer/violations/review-queue${queryParams.toString() ? `?${queryParams}` : ''}`
    const response = await apiClient.get<ViolationListResponse>(endpoint)
    return {
      violations: response.violations.map(mapViolation),
      total: response.total,
      page: response.page,
      size: response.size,
    }
  },

  processViolation: async (
    id: string,
    action: 'approve' | 'reject' | 'verified' | 'processed',
    notes?: string
  ): Promise<Violation> => {
    const response = await apiClient.post<ViolationResponse>(`/v1/officer/violations/${id}/review`, {
      action,
      notes: notes || '',
    })
    return mapViolation(response)
  },
}



export const adminApi = {
  getStatistics: async (): Promise<unknown> => {
    return apiClient.get('/v1/admin/dashboard/stats')
  },

  getCameras: async (): Promise<unknown[]> => {
    return [] as unknown as unknown[]
  },

  getOfficers: async (): Promise<PaginatedResponse<Officer>> => {
    return apiClient.get<PaginatedResponse<Officer>>('/v1/admin/users?role=officer')
  },

  createOfficer: async (data: {
    username: string
    email: string
    password: string
  }): Promise<unknown> => {
    return apiClient.post('/v1/admin/users/officers', data)
  },
}

// Denunciations API Types
export interface DenunciationResponse {
  id: number
  denunciation_code: string
  title: string
  description: string
  denunciation_type: string
  status: string
  severity_level: string
  urgency_level: string
  informant_name?: string
  informant_phone?: string
  informant_email?: string
  accused_person_name?: string
  accused_person_position?: string
  accused_department?: string
  related_violation_id?: number
  related_user_id?: number
  assigned_investigator_id?: number
  assigned_at?: string
  resolved_at?: string
  investigation_notes?: string
  resolution?: string
  security_level: string
  is_whistleblower: boolean
  transferred_to?: string
  transfer_reason?: string
  transferred_at?: string
  created_at: string
  updated_at: string
  is_anonymous: boolean
}

export interface DenunciationListResponse {
  denunciations: DenunciationResponse[]
  total: number
  page: number
  size: number
}

export interface DenunciationCreate {
  title: string
  description: string
  denunciation_type: string
  is_anonymous?: boolean
  informant_name?: string
  informant_phone?: string
  informant_email?: string
  informant_identification?: string
  informant_address?: string
  accused_person_name?: string
  accused_person_position?: string
  accused_department?: string
  related_violation_id?: number
  related_user_id?: number
  evidence_urls?: string[]
  severity_level?: string
  urgency_level?: string
  is_whistleblower?: boolean
}

// Denunciations API
export const denunciationsApi = {
  getAll: async (params?: {
    page?: number
    limit?: number
    status?: string
    denunciation_type?: string
    severity?: string
  }): Promise<DenunciationListResponse> => {
    const limit = params?.limit ?? 50
    const page = params?.page ?? 1
    const skip = (page - 1) * limit
    const queryParams = new URLSearchParams()
    queryParams.append('skip', skip.toString())
    queryParams.append('limit', limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.denunciation_type) queryParams.append('denunciation_type', params.denunciation_type)
    if (params?.severity) queryParams.append('severity', params.severity)

    const endpoint = `/v1/denunciations${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiClient.get<DenunciationListResponse>(endpoint)
  },

  getById: async (id: number): Promise<DenunciationResponse> => {
    return apiClient.get<DenunciationResponse>(`/v1/denunciations/${id}`)
  },

  create: async (data: DenunciationCreate): Promise<DenunciationResponse> => {
    return apiClient.post<DenunciationResponse>('/v1/denunciations', data)
  },

  getAssigned: async (): Promise<DenunciationListResponse> => {
    return apiClient.get<DenunciationListResponse>('/v1/denunciations/assigned')
  },

  getStats: async (startDate: string, endDate: string): Promise<{
    total_denunciations: number
    by_status: Record<string, number>
    by_type: Record<string, number>
    by_severity: Record<string, any>
    resolution_rate: number
    average_processing_time: number
  }> => {
    const queryParams = new URLSearchParams()
    queryParams.append('start_date', startDate)
    queryParams.append('end_date', endDate)
    return apiClient.get(`/v1/denunciations/stats?${queryParams.toString()}`)
  },
}

// Dashboard API Types
export interface DashboardStat {
  title: string
  value: string
  change: string
  icon: "up" | "down" | "stable"
  color: string
}

export interface RecentViolation {
  id: string
  type: string
  location: string
  time: string
  status: "processed" | "pending"
}

export interface SystemActivity {
  action: string
  time: string
  type: "violation" | "process" | "report" | "system"
}

export interface StatisticsData {
  overview: {
    total_violations: number
    pending_violations: number
    processed_violations: number
    total_revenue: number
    processing_rate: number
  }
  trends: Array<{
    date: string
    count: number
  }>
  types: Array<{
    type: string
    count: number
  }>
  locations: Array<{
    location: string
    count: number
  }>
  efficiency: {
    total_processed: number
    total_pending: number
    avg_processing_hours: number
    processing_rate: number
  }
}

export interface Camera {
  id: number  // Numeric database ID
  camera_id: string  // String identifier
  name: string
  location_name?: string  // Optional in backend
  address?: string
  status: "online" | "offline" | "maintenance"
  violations_today: number  // Always present in backend
  last_violation_at?: string
  latitude?: number
  longitude?: number
  camera_type?: string
  resolution?: string
  // Additional fields from backend
  enabled_detections?: Record<string, any>
  ai_model_version?: string
  confidence_threshold?: number
  created_at?: string
  updated_at?: string
}

export interface CameraListResponse {
  items: Camera[]
  total: number
  page: number
  size: number
}

// Dashboard API
export const dashboardApi = {
  // Get admin dashboard stats
  getAdminStats: async (): Promise<{
    total_users: number
    total_officers: number
    total_citizens: number
    system_health: string
  }> => {
    return apiClient.get('/v1/admin/dashboard/stats')
  },

  // Get recent violations for dashboard
  getRecentViolations: async (limit: number = 10): Promise<RecentViolation[]> => {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    return apiClient.get(`/v1/violations/recent?${params.toString()}`)
  },

  // Get recent system activities
  getRecentActivities: async (limit: number = 10): Promise<SystemActivity[]> => {
    return apiClient.get(`/v1/activities/recent?limit=${limit}`)
  },

  // Get comprehensive statistics
  getStatistics: async (range: '7days' | '30days' | '3months' | 'year' = '7days'): Promise<StatisticsData> => {
    return apiClient.get(`/v1/statistics?range=${range}`)
  },
}

// Camera API
export const cameraApi = {
  // Get all cameras
  getAll: async (params?: {
    skip?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<CameraListResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)

    const endpoint = `/v1/cameras${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiClient.get<CameraListResponse>(endpoint)
  },

  // Get camera by ID (using camera_id string)
  getById: async (cameraId: string): Promise<Camera> => {
    return apiClient.get<Camera>(`/v1/cameras/${cameraId}`)
  },

  // Create camera (admin/officer only)
  create: async (data: {
    camera_id: string
    name: string
    location_name?: string
    address?: string
    latitude?: number
    longitude?: number
    camera_type?: string
    resolution?: string
  }): Promise<Camera> => {
    return apiClient.post<Camera>('/v1/cameras', data)
  },

  // Update camera (admin/officer only)
  update: async (cameraId: string, data: Partial<Camera>): Promise<Camera> => {
    return apiClient.put<Camera>(`/v1/cameras/${cameraId}`, data)
  },

  // Delete camera (admin only)
  delete: async (cameraId: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/v1/cameras/${cameraId}`)
  },
}

// Video API Types
export interface CameraVideo {
  id: number
  camera_id: number
  cloudinary_public_id: string
  cloudinary_url: string
  thumbnail_url?: string
  duration?: number  // in seconds
  file_size?: number  // in bytes
  format?: string  // mp4, avi, mov
  uploaded_by: number
  uploaded_at: string
  processed_at?: string
  processing_status: "pending" | "processing" | "completed" | "failed"
  has_violations: boolean
  violation_count: number
  // Additional metadata from backend
  video_metadata?: Record<string, any>
}

export interface VideoListResponse {
  videos: CameraVideo[]
  total: number
  page: number
  size: number
}

export interface VideoStatsByDate {
  date: string
  video_count: number
  total_duration: number
  violation_count: number
}

export interface VideoStatsResponse {
  total_videos: number
  total_duration: number
  total_violations: number
  videos_with_violations: number
  avg_duration: number
  by_date: VideoStatsByDate[]
}

// Video Upload Response Type
export interface VideoUploadResponse {
  video_id: number
  cloudinary_url: string
  thumbnail_url?: string
  processing_job_id: number
  status: "pending" | "processing" | "completed" | "failed"
}

// Video API
export const videoApi = {
  // Upload video
  upload: async (params: {
    file: File
    camera_id: number
    recorded_at?: string
  }): Promise<VideoUploadResponse> => {
    const formData = new FormData()
    formData.append('file', params.file)
    formData.append('camera_id', params.camera_id.toString())
    if (params.recorded_at) {
      formData.append('recorded_at', params.recorded_at)
    }

    return apiClient.postFormData<VideoUploadResponse>('/v1/videos/upload', formData)
  },

  // Get videos by camera
  getByCameraId: async (params: {
    cameraId: number
    skip?: number
    limit?: number
    has_violations?: boolean
    processing_status?: string
    date_from?: string
    date_to?: string
  }): Promise<VideoListResponse> => {
    const queryParams = new URLSearchParams()
    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params.has_violations !== undefined) queryParams.append('has_violations', params.has_violations.toString())
    if (params.processing_status) queryParams.append('processing_status', params.processing_status)
    if (params.date_from) queryParams.append('date_from', params.date_from)
    if (params.date_to) queryParams.append('date_to', params.date_to)

    const endpoint = `/v1/videos/cameras/${params.cameraId}/videos${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiClient.get<VideoListResponse>(endpoint)
  },

  // Get video by ID
  getById: async (videoId: number): Promise<CameraVideo> => {
    return apiClient.get<CameraVideo>(`/v1/videos/${videoId}`)
  },

  // Delete video
  delete: async (videoId: number): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/v1/videos/${videoId}`)
  },

  // Queue video for AI analysis
  analyze: async (videoId: number): Promise<{
    job_id: number
    status: string
    video_id: number
    message: string
  }> => {
    return apiClient.post(`/v1/videos/${videoId}/analyze`)
  },

  // Get video statistics for a camera
  getStats: async (params: {
    cameraId: number
    date_from?: string
    date_to?: string
  }): Promise<VideoStatsResponse> => {
    const queryParams = new URLSearchParams()
    if (params.date_from) queryParams.append('date_from', params.date_from)
    if (params.date_to) queryParams.append('date_to', params.date_to)

    const endpoint = `/v1/videos/cameras/${params.cameraId}/video-stats${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiClient.get<VideoStatsResponse>(endpoint)
  },
}

// Detection API Types
export interface AIDetection {
  id: number
  video_id: number
  detection_type: "license_plate" | "vehicle_count" | "violation"
  timestamp: number
  confidence: number
  data: Record<string, any>
  detected_at: string
  reviewed: boolean
  review_status?: "pending" | "approved" | "rejected"
  violation_id?: number
}

export interface PendingDetectionsResponse {
  detections: AIDetection[]
  total: number
  page: number
  size: number
}

export interface DetectionReviewRequest {
  action: "approve" | "reject" | "modify"
  notes?: string
  modified_data?: Record<string, any>
}

export interface DetectionReviewResponse {
  detection: AIDetection
  violation_created: boolean
  violation_id?: number
  message: string
}

// Detection API
export const detectionApi = {
  // Get pending detections
  getPending: async (params?: {
    camera_id?: number
    violation_type?: string
    min_confidence?: number
    date_from?: string
    date_to?: string
    skip?: number
    limit?: number
  }): Promise<PendingDetectionsResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.camera_id !== undefined) queryParams.append('camera_id', params.camera_id.toString())
    if (params?.violation_type) queryParams.append('violation_type', params.violation_type)
    if (params?.min_confidence !== undefined) queryParams.append('min_confidence', params.min_confidence.toString())
    if (params?.date_from) queryParams.append('date_from', params.date_from)
    if (params?.date_to) queryParams.append('date_to', params.date_to)
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())

    const endpoint = `/v1/videos/detections/pending${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiClient.get<PendingDetectionsResponse>(endpoint)
  },

  // Review a detection
  review: async (detectionId: number, request: DetectionReviewRequest): Promise<DetectionReviewResponse> => {
    return apiClient.post<DetectionReviewResponse>(`/v1/videos/detections/${detectionId}/review`, request)
  },

  // Get detections for a specific video
  getByVideoId: async (videoId: number, params?: {
    detection_type?: string
    min_confidence?: number
  }): Promise<{ video_id: number; total_detections: number; detections: AIDetection[] }> => {
    const queryParams = new URLSearchParams()
    if (params?.detection_type) queryParams.append('detection_type', params.detection_type)
    if (params?.min_confidence !== undefined) queryParams.append('min_confidence', params.min_confidence.toString())

    const endpoint = `/v1/videos/${videoId}/detections${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiClient.get(endpoint)
  },

  // Create violation from detection
  createViolation: async (detectionId: number, officerId?: number): Promise<{
    success: boolean
    violation_id: number
    detection_id: number
    status: string
    license_plate: string
    violation_type: string
    assigned_to?: number
    message: string
  }> => {
    const queryParams = new URLSearchParams()
    if (officerId !== undefined) queryParams.append('officer_id', officerId.toString())

    const endpoint = `/v1/videos/detections/${detectionId}/create-violation${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiClient.post(endpoint)
  },
}

// Vehicle API Types
export interface Vehicle {
  id: number
  license_plate: string
  owner_id: number
  make?: string
  model?: string
  year?: number
  color?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VehicleCreate {
  license_plate: string
  make?: string
  model?: string
  year?: number
  color?: string
  is_active?: boolean
}

export interface VehicleUpdate {
  license_plate?: string
  make?: string
  model?: string
  year?: number
  color?: string
  is_active?: boolean
}

// Driving License API Types
export interface DrivingLicense {
  id: number
  license_number: string
  user_id: number
  license_class: string
  full_name: string
  date_of_birth: string
  nationality?: string
  address?: string
  issue_date: string
  expiry_date: string
  issue_place?: string
  total_points: number
  current_points: number
  points_reset_date?: string
  status: string
  suspension_start?: string
  suspension_end?: string
  revocation_reason?: string
  total_violations: number
  serious_violations: number
  points_deduction_history?: any[]
  created_at: string
  updated_at: string
}

export interface DrivingLicenseCreate {
  license_number: string
  license_class: string
  full_name: string
  date_of_birth: string
  nationality?: string
  address?: string
  issue_date: string
  expiry_date: string
  issue_place?: string
}

export interface DrivingLicenseUpdate {
  license_class?: string
  full_name?: string
  date_of_birth?: string
  nationality?: string
  address?: string
  issue_date?: string
  expiry_date?: string
  issue_place?: string
}

// Video Analytics API Types
export interface VideoAnalytics {
  summary: {
    total_videos: number
    completed_videos: number
    failed_videos: number
    pending_videos: number
    processing_success_rate: number
    total_detections: number
    detection_accuracy_rate: number
    date_range: {
      from: string
      to: string
    }
  }
  videos_per_period: Array<{
    date: string
    total_videos: number
    processed: number
    failed: number
    pending: number
  }>
  detection_accuracy: {
    total_reviewed: number
    approved: number
    rejected: number
    accuracy_rate: number
    pending_review: number
  }
  top_violation_types: Array<{
    violation_type: string
    count: number
    avg_confidence: number
  }>
  camera_performance: Array<{
    camera_id: number
    camera_name: string
    location: string
    total_videos: number
    processed_videos: number
    total_violations: number
    avg_video_duration: number
    processing_rate: number
  }>
}

// Video Analytics API
export const videoAnalyticsApi = {
  // Get video analytics
  getAnalytics: async (params?: {
    date_from?: string
    date_to?: string
    camera_id?: number
  }): Promise<VideoAnalytics> => {
    const queryParams = new URLSearchParams()
    if (params?.date_from) queryParams.append('date_from', params.date_from)
    if (params?.date_to) queryParams.append('date_to', params.date_to)
    if (params?.camera_id !== undefined) queryParams.append('camera_id', params.camera_id.toString())

    const endpoint = `/v1/video-analytics/analytics${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiClient.get<VideoAnalytics>(endpoint)
  },
}

// Vehicle API
export const vehicleApi = {
  // Get user's vehicles
  getMyVehicles: (): Promise<Vehicle[]> => apiClient.get('/v1/vehicles/my-vehicles'),
  
  // Create new vehicle
  create: (data: VehicleCreate): Promise<Vehicle> => apiClient.post('/v1/vehicles', data),
  
  // Get specific vehicle
  getById: (id: number): Promise<Vehicle> => apiClient.get(`/v1/vehicles/${id}`),
  
  // Update vehicle
  update: (id: number, data: VehicleUpdate): Promise<Vehicle> => apiClient.put(`/v1/vehicles/${id}`, data),
  
  // Delete vehicle
  delete: (id: number): Promise<{ message: string }> => apiClient.delete(`/v1/vehicles/${id}`)
}

// Driving License API
export const drivingLicenseApi = {
  // Get user's driving license
  getMy: (): Promise<DrivingLicense | null> => apiClient.get('/v1/driving-licenses/my-license'),
  
  // Create driving license
  create: (data: DrivingLicenseCreate): Promise<DrivingLicense> => apiClient.post('/v1/driving-licenses', data),
  
  // Update driving license
  update: (id: number, data: DrivingLicenseUpdate): Promise<DrivingLicense> => apiClient.put(`/v1/driving-licenses/${id}`, data),
  
  // Delete driving license
  delete: (id: number): Promise<{ message: string }> => apiClient.delete(`/v1/driving-licenses/${id}`),
  
  // Check license status
  checkStatus: (licenseNumber: string): Promise<{
    license_number: string
    current_points: number
    total_points: number
    status: string
    expiry_date: string
    is_expired: boolean
    is_suspended: boolean
    suspension_period?: { start: string; end: string }
    points_reset_date?: string
  }> => apiClient.get(`/v1/driving-licenses/${licenseNumber}/status`)
}

export { ApiError }
export default apiClient

// Payment API Types
export interface Payment {
  id: number
  user_id: number
  violation_id?: number
  amount: number
  payment_type: string
  payment_method: string
  status: string
  paid_at?: string
  qr_code_image_base64?: string
  qr_transaction_id?: string
  qr_expiry_time?: string
  bank_account_number?: string
  bank_name?: string
  transfer_content?: string
  created_at: string
  updated_at: string
}

export interface WalletSummary {
  balance: number
  total_deposits: number
  total_payments: number
  pending_payments: number
}

export interface PaymentReceipt {
  payment_id: number
  receipt_number: string
  amount: number
  payment_date: string
  payment_method: string
  violation_info?: {
    violation_id: number
    license_plate: string
    violation_type: string
    location: string
    detected_at: string
  }
  user_info: {
    full_name: string
    email: string
  }
}

export interface QRPaymentResponse {
  payment_id: number
  qr_url?: string  // QR URL từ VietQR
  qr_image_base64?: string  // Giữ lại để backward compatibility
  qr_transaction_id: string
  amount: number
  bank_account_number: string
  bank_name: string
  transfer_content: string
  expiry_time: string
}

// Payment API
export const paymentApi = {
  // Create fine payment
  createFinePayment: async (violationId: number): Promise<Payment> => {
    return apiClient.post(`/v1/payments/fines/${violationId}`)
  },

  // Deposit to wallet
  depositToWallet: async (params: {
    amount: number
    payment_method: 'bank_transfer' | 'credit_card' | 'e_wallet'
  }): Promise<Payment> => {
    const queryParams = new URLSearchParams()
    queryParams.append('amount', params.amount.toString())
    queryParams.append('payment_method', params.payment_method)
    return apiClient.post(`/v1/payments/wallet/deposit?${queryParams}`)
  },

  // Pay fine from wallet
  payFineFromWallet: async (paymentId: number): Promise<Payment> => {
    return apiClient.post(`/v1/payments/fines/${paymentId}/pay-from-wallet`)
  },

  // Get my payments
  getMyPayments: async (paymentType?: string): Promise<Payment[]> => {
    const queryParams = new URLSearchParams()
    if (paymentType) queryParams.append('payment_type', paymentType)
    const endpoint = `/v1/payments/my-payments${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiClient.get(endpoint)
  },

  // Get wallet summary
  getWalletSummary: async (): Promise<WalletSummary> => {
    return apiClient.get('/v1/payments/wallet/summary')
  },

  // Get payment receipt
  getReceipt: async (paymentId: number): Promise<PaymentReceipt> => {
    return apiClient.get(`/v1/payments/payments/${paymentId}/receipt`)
  },

  // Create QR payment
  createQRPayment: async (userId: number, paymentId: number): Promise<QRPaymentResponse> => {
    return apiClient.post(`/v1/payments/qr/${userId}/${paymentId}`)
  },

  // Get payment status
  getPaymentStatus: async (paymentId: number): Promise<{
    payment_id: number
    status: string
    amount: number
    paid_at?: string
    qr_expiry?: string
  }> => {
    return apiClient.get(`/v1/payments/payments/${paymentId}/status`)
  },
}
