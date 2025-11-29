import { renderHook, waitFor } from '@testing-library/react'
import { useVideos } from '@/hooks/useVideos'
import { videoApi } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  videoApi: {
    getByCameraId: jest.fn()
  }
}))

const mockVideoApi = videoApi as jest.Mocked<typeof videoApi>

const mockVideosResponse = {
  videos: [
    {
      id: 1,
      camera_id: 1,
      filename: 'video1.mp4',
      cloudinary_url: 'https://cloudinary.com/video1.mp4',
      thumbnail_url: 'https://cloudinary.com/thumb1.jpg',
      duration: 120,
      file_size: 1024000,
      format: 'mp4',
      resolution: '1920x1080',
      processing_status: 'completed',
      has_violations: true,
      violation_count: 2,
      uploaded_at: '2024-01-01T10:00:00Z',
      processed_at: '2024-01-01T10:05:00Z'
    }
  ],
  total: 1,
  page: 1
}

describe('useVideos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches videos successfully', async () => {
    mockVideoApi.getByCameraId.mockResolvedValue(mockVideosResponse)
    
    const { result } = renderHook(() => useVideos({ cameraId: 1 }))
    
    expect(result.current.loading).toBe(true)
    expect(result.current.videos).toEqual([])
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.videos).toEqual(mockVideosResponse.videos)
    expect(result.current.total).toBe(1)
    expect(result.current.page).toBe(1)
    expect(result.current.error).toBeNull()
  })

  it('handles API error', async () => {
    const errorMessage = 'Failed to fetch videos'
    mockVideoApi.getByCameraId.mockRejectedValue(new Error(errorMessage))
    
    const { result } = renderHook(() => useVideos({ cameraId: 1 }))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.videos).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.error).toBe(errorMessage)
  })

  it('passes all parameters to API call', async () => {
    mockVideoApi.getByCameraId.mockResolvedValue(mockVideosResponse)
    
    const params = {
      cameraId: 1,
      skip: 10,
      limit: 20,
      has_violations: true,
      date_from: '2024-01-01',
      date_to: '2024-01-31'
    }
    
    renderHook(() => useVideos(params))
    
    await waitFor(() => {
      expect(mockVideoApi.getByCameraId).toHaveBeenCalledWith(params)
    })
  })

  it('refetches data when refetch is called', async () => {
    mockVideoApi.getByCameraId.mockResolvedValue(mockVideosResponse)
    
    const { result } = renderHook(() => useVideos({ cameraId: 1 }))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Clear the mock to verify refetch call
    mockVideoApi.getByCameraId.mockClear()
    
    // Call refetch
    result.current.refetch()
    
    expect(mockVideoApi.getByCameraId).toHaveBeenCalledTimes(1)
  })

  it('refetches when parameters change', async () => {
    mockVideoApi.getByCameraId.mockResolvedValue(mockVideosResponse)
    
    const { rerender } = renderHook(
      ({ params }) => useVideos(params),
      { initialProps: { params: { cameraId: 1 } } }
    )
    
    await waitFor(() => {
      expect(mockVideoApi.getByCameraId).toHaveBeenCalledWith({ cameraId: 1 })
    })
    
    // Change parameters
    rerender({ params: { cameraId: 1, has_violations: true } })
    
    await waitFor(() => {
      expect(mockVideoApi.getByCameraId).toHaveBeenCalledWith({ 
        cameraId: 1, 
        has_violations: true 
      })
    })
    
    expect(mockVideoApi.getByCameraId).toHaveBeenCalledTimes(2)
  })

  it('handles empty response', async () => {
    mockVideoApi.getByCameraId.mockResolvedValue({
      videos: [],
      total: 0,
      page: 1
    })
    
    const { result } = renderHook(() => useVideos({ cameraId: 1 }))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.videos).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.page).toBe(1)
    expect(result.current.error).toBeNull()
  })

  it('handles network timeout error', async () => {
    const timeoutError = new Error('Request timeout')
    timeoutError.name = 'TimeoutError'
    mockVideoApi.getByCameraId.mockRejectedValue(timeoutError)
    
    const { result } = renderHook(() => useVideos({ cameraId: 1 }))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.error).toBe('Request timeout')
  })

  it('handles different camera IDs', async () => {
    mockVideoApi.getByCameraId.mockResolvedValue(mockVideosResponse)
    
    const { rerender } = renderHook(
      ({ cameraId }) => useVideos({ cameraId }),
      { initialProps: { cameraId: 1 } }
    )
    
    await waitFor(() => {
      expect(mockVideoApi.getByCameraId).toHaveBeenCalledWith({ cameraId: 1 })
    })
    
    // Change camera ID
    rerender({ cameraId: 2 })
    
    await waitFor(() => {
      expect(mockVideoApi.getByCameraId).toHaveBeenCalledWith({ cameraId: 2 })
    })
    
    expect(mockVideoApi.getByCameraId).toHaveBeenCalledTimes(2)
  })
})