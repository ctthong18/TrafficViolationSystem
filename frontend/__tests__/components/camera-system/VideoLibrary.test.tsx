import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VideoLibrary } from '@/components/camera-system/VideoLibrary'
import { useVideos } from '@/hooks/useVideos'
import { CameraVideo } from '@/lib/api'

// Mock the useVideos hook
jest.mock('@/hooks/useVideos')
const mockUseVideos = useVideos as jest.MockedFunction<typeof useVideos>

// Mock video data
const mockVideos: CameraVideo[] = [
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
  },
  {
    id: 2,
    camera_id: 1,
    filename: 'video2.mp4',
    cloudinary_url: 'https://cloudinary.com/video2.mp4',
    thumbnail_url: 'https://cloudinary.com/thumb2.jpg',
    duration: 60,
    file_size: 512000,
    format: 'mp4',
    resolution: '1920x1080',
    processing_status: 'processing',
    has_violations: false,
    violation_count: 0,
    uploaded_at: '2024-01-01T11:00:00Z',
    processed_at: null
  }
]

const defaultMockReturn = {
  videos: mockVideos,
  total: 2,
  loading: false,
  error: null,
  refetch: jest.fn()
}

describe('VideoLibrary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseVideos.mockReturnValue(defaultMockReturn)
  })

  it('renders video library with camera name', () => {
    render(<VideoLibrary cameraId={1} cameraName="Camera Test" />)
    
    expect(screen.getByText('Thư viện Video - Camera Test')).toBeInTheDocument()
  })

  it('renders video library without camera name', () => {
    render(<VideoLibrary cameraId={1} />)
    
    expect(screen.getByText('Thư viện Video')).toBeInTheDocument()
  })

  it('displays loading state', () => {
    mockUseVideos.mockReturnValue({
      ...defaultMockReturn,
      videos: [],
      loading: true
    })
    
    render(<VideoLibrary cameraId={1} />)
    
    expect(screen.getByText('Đang tải video...')).toBeInTheDocument()
  })

  it('displays error state with retry button', () => {
    const mockRefetch = jest.fn()
    mockUseVideos.mockReturnValue({
      ...defaultMockReturn,
      videos: [],
      loading: false,
      error: 'Network error',
      refetch: mockRefetch
    })
    
    render(<VideoLibrary cameraId={1} />)
    
    expect(screen.getByText('Network error')).toBeInTheDocument()
    
    const retryButton = screen.getByText('Thử lại')
    fireEvent.click(retryButton)
    
    expect(mockRefetch).toHaveBeenCalled()
  })

  it('displays empty state when no videos found', () => {
    mockUseVideos.mockReturnValue({
      ...defaultMockReturn,
      videos: [],
      total: 0
    })
    
    render(<VideoLibrary cameraId={1} />)
    
    expect(screen.getByText('Không tìm thấy video nào')).toBeInTheDocument()
  })

  it('displays videos in grid view by default', () => {
    render(<VideoLibrary cameraId={1} />)
    
    expect(screen.getByText('Tìm thấy 2 video')).toBeInTheDocument()
    
    // Check if videos are displayed
    expect(screen.getByText('2 vi phạm')).toBeInTheDocument()
    expect(screen.getByText('Hoàn thành')).toBeInTheDocument()
    expect(screen.getByText('Đang xử lý')).toBeInTheDocument()
  })

  it('switches between grid and list view', () => {
    render(<VideoLibrary cameraId={1} />)
    
    // Switch to list view
    const listViewButton = screen.getByRole('button', { name: /list/i })
    fireEvent.click(listViewButton)
    
    // Should still show videos but in list format
    expect(screen.getByText('2 vi phạm')).toBeInTheDocument()
  })

  it('filters videos by violation status', async () => {
    render(<VideoLibrary cameraId={1} />)
    
    // Open violations filter
    const violationsFilter = screen.getByDisplayValue('Tất cả video')
    fireEvent.click(violationsFilter)
    
    // Select "Có vi phạm"
    const hasViolationsOption = screen.getByText('Có vi phạm')
    fireEvent.click(hasViolationsOption)
    
    // Should trigger useVideos with has_violations: true
    await waitFor(() => {
      expect(mockUseVideos).toHaveBeenCalledWith(
        expect.objectContaining({
          cameraId: 1,
          has_violations: true
        })
      )
    })
  })

  it('sorts videos by different criteria', async () => {
    render(<VideoLibrary cameraId={1} />)
    
    // Open sort dropdown
    const sortSelect = screen.getByDisplayValue('Mới nhất')
    fireEvent.click(sortSelect)
    
    // Select "Dài nhất"
    const durationSort = screen.getByText('Dài nhất')
    fireEvent.click(durationSort)
    
    // Videos should be re-sorted (client-side sorting)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Dài nhất')).toBeInTheDocument()
    })
  })

  it('resets filters when reset button is clicked', async () => {
    render(<VideoLibrary cameraId={1} />)
    
    // Apply some filters first
    const violationsFilter = screen.getByDisplayValue('Tất cả video')
    fireEvent.click(violationsFilter)
    const hasViolationsOption = screen.getByText('Có vi phạm')
    fireEvent.click(hasViolationsOption)
    
    // Reset filters
    const resetButton = screen.getByText('Đặt lại')
    fireEvent.click(resetButton)
    
    // Should reset to default state
    await waitFor(() => {
      expect(screen.getByDisplayValue('Tất cả video')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Mới nhất')).toBeInTheDocument()
    })
  })

  it('opens video player dialog when video is clicked', () => {
    render(<VideoLibrary cameraId={1} />)
    
    // Click on first video
    const videoButton = screen.getAllByText('Xem video')[0]
    fireEvent.click(videoButton)
    
    // Should open dialog with video player
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('formats duration correctly', () => {
    render(<VideoLibrary cameraId={1} />)
    
    // Check if duration is formatted as MM:SS
    expect(screen.getByText('2:00')).toBeInTheDocument() // 120 seconds
    expect(screen.getByText('1:00')).toBeInTheDocument() // 60 seconds
  })

  it('displays violation badges correctly', () => {
    render(<VideoLibrary cameraId={1} />)
    
    // Should show violation count for videos with violations
    expect(screen.getByText('2 vi phạm')).toBeInTheDocument()
    
    // Should not show violation badge for videos without violations
    const violationBadges = screen.getAllByText(/vi phạm/)
    expect(violationBadges).toHaveLength(1)
  })

  it('displays processing status badges correctly', () => {
    render(<VideoLibrary cameraId={1} />)
    
    expect(screen.getByText('Hoàn thành')).toBeInTheDocument()
    expect(screen.getByText('Đang xử lý')).toBeInTheDocument()
  })

  it('handles date filtering', async () => {
    render(<VideoLibrary cameraId={1} />)
    
    // Click on "Từ ngày" button
    const fromDateButton = screen.getByText('Từ ngày')
    fireEvent.click(fromDateButton)
    
    // Calendar should be visible
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('displays correct video count', () => {
    render(<VideoLibrary cameraId={1} />)
    
    expect(screen.getByText('Tìm thấy 2 video')).toBeInTheDocument()
  })

  it('handles pagination when total pages > 1', () => {
    mockUseVideos.mockReturnValue({
      ...defaultMockReturn,
      total: 25 // This would create multiple pages with limit 12
    })
    
    render(<VideoLibrary cameraId={1} />)
    
    // Should show pagination controls
    expect(screen.getByText('Trang 1 /')).toBeInTheDocument()
  })
})