import { renderHook, waitFor } from '@testing-library/react'
import { useCameras, useCamera } from '@/hooks/useCameras'
import { cameraApi } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  cameraApi: {
    getAll: jest.fn(),
    getById: jest.fn()
  }
}))

const mockCameraApi = cameraApi as jest.Mocked<typeof cameraApi>

const mockCamerasResponse = {
  items: [
    {
      id: 1,
      camera_id: 'CAM001',
      name: 'Camera 1',
      location_name: 'Location 1',
      address: 'Location 1',
      status: 'online',
      violations_today: 0,
      ai_model_version: 'v2.1',
      confidence_threshold: 0.8,
      enabled_detections: { vehicle: true, person: true },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  total: 1
}

const mockCamera = mockCamerasResponse.items[0]

describe('useCameras', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches cameras successfully', async () => {
    mockCameraApi.getAll.mockResolvedValue(mockCamerasResponse)
    
    const { result } = renderHook(() => useCameras())
    
    expect(result.current.loading).toBe(true)
    expect(result.current.cameras).toEqual([])
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.cameras).toEqual(mockCamerasResponse.items)
    expect(result.current.total).toBe(1)
    expect(result.current.error).toBeNull()
  })

  it('handles API error', async () => {
    const errorMessage = 'Network error'
    mockCameraApi.getAll.mockRejectedValue(new Error(errorMessage))
    
    const { result } = renderHook(() => useCameras())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.cameras).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.error).toBe(errorMessage)
  })

  it('passes parameters to API call', async () => {
    mockCameraApi.getAll.mockResolvedValue(mockCamerasResponse)
    
    const params = {
      skip: 10,
      limit: 20,
      status: 'online',
      search: 'camera'
    }
    
    renderHook(() => useCameras(params))
    
    await waitFor(() => {
      expect(mockCameraApi.getAll).toHaveBeenCalledWith(params)
    })
  })

  it('refetches data when refetch is called', async () => {
    mockCameraApi.getAll.mockResolvedValue(mockCamerasResponse)
    
    const { result } = renderHook(() => useCameras())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Clear the mock to verify refetch call
    mockCameraApi.getAll.mockClear()
    
    // Call refetch
    result.current.refetch()
    
    expect(mockCameraApi.getAll).toHaveBeenCalledTimes(1)
  })

  it('handles empty response', async () => {
    mockCameraApi.getAll.mockResolvedValue({ items: [], total: 0 })
    
    const { result } = renderHook(() => useCameras())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.cameras).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.error).toBeNull()
  })

  it('handles malformed response', async () => {
    mockCameraApi.getAll.mockResolvedValue({} as any)
    
    const { result } = renderHook(() => useCameras())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.cameras).toEqual([])
    expect(result.current.total).toBe(0)
  })
})

describe('useCamera', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches single camera successfully', async () => {
    mockCameraApi.getById.mockResolvedValue(mockCamera)
    
    const { result } = renderHook(() => useCamera('CAM001'))
    
    expect(result.current.loading).toBe(true)
    expect(result.current.camera).toBeNull()
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.camera).toEqual(mockCamera)
    expect(result.current.error).toBeNull()
  })

  it('handles API error for single camera', async () => {
    const errorMessage = 'Camera not found'
    mockCameraApi.getById.mockRejectedValue(new Error(errorMessage))
    
    const { result } = renderHook(() => useCamera('CAM001'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.camera).toBeNull()
    expect(result.current.error).toBe(errorMessage)
  })

  it('does not fetch when cameraId is empty', () => {
    renderHook(() => useCamera(''))
    
    expect(mockCameraApi.getById).not.toHaveBeenCalled()
  })

  it('refetches when cameraId changes', async () => {
    mockCameraApi.getById.mockResolvedValue(mockCamera)
    
    const { rerender } = renderHook(
      ({ cameraId }) => useCamera(cameraId),
      { initialProps: { cameraId: 'CAM001' } }
    )
    
    await waitFor(() => {
      expect(mockCameraApi.getById).toHaveBeenCalledWith('CAM001')
    })
    
    // Change camera ID
    rerender({ cameraId: 'CAM002' })
    
    await waitFor(() => {
      expect(mockCameraApi.getById).toHaveBeenCalledWith('CAM002')
    })
    
    expect(mockCameraApi.getById).toHaveBeenCalledTimes(2)
  })
})