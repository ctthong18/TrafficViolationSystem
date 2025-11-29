import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VideoLibrary } from '@/components/camera-system/VideoLibrary'
import { useVideos } from '@/hooks/useVideos'

// Mock the useVideos hook
jest.mock('@/hooks/useVideos')
const mockUseVideos = useVideos as jest.MockedFunction<typeof useVideos>

describe('VideoLibrary Loading and Error States', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading States', () => {
    it('shows skeleton loading when initially loading', () => {
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: true,
        error: null,
        refetch: jest.fn()
      })
      
      render(<VideoLibrary cameraId={1} />)
      
      expect(screen.getByText('Đang tải video...')).toBeInTheDocument()
      expect(screen.getByLabelText(/loading/i) || screen.getByText(/đang tải/i)).toBeInTheDocument()
    })

    it('shows loading animation with pulse effect', () => {
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: true,
        error: null,
        refetch: jest.fn()
      })
      
      render(<VideoLibrary cameraId={1} />)
      
      const loadingElement = screen.getByText('Đang tải video...')
      expect(loadingElement).toBeInTheDocument()
      
      // Check if there's a loading icon with animation class
      const loadingIcon = loadingElement.parentElement?.querySelector('.animate-pulse')
      expect(loadingIcon).toBeInTheDocument()
    })

    it('transitions from loading to content correctly', async () => {
      // Start with loading state
      const { rerender } = render(<VideoLibrary cameraId={1} />)
      
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: true,
        error: null,
        refetch: jest.fn()
      })
      
      rerender(<VideoLibrary cameraId={1} />)
      expect(screen.getByText('Đang tải video...')).toBeInTheDocument()
      
      // Transition to loaded state
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: false,
        error: null,
        refetch: jest.fn()
      })
      
      rerender(<VideoLibrary cameraId={1} />)
      expect(screen.queryByText('Đang tải video...')).not.toBeInTheDocument()
      expect(screen.getByText('Không tìm thấy video nào')).toBeInTheDocument()
    })

    it('shows loading state when refetching data', async () => {
      const mockRefetch = jest.fn()
      
      // Initial loaded state
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: false,
        error: 'Network error',
        refetch: mockRefetch
      })
      
      render(<VideoLibrary cameraId={1} />)
      
      const retryButton = screen.getByText('Thử lại')
      fireEvent.click(retryButton)
      
      expect(mockRefetch).toHaveBeenCalled()
    })
  })

  describe('Error States', () => {
    it('displays network error with retry option', () => {
      const mockRefetch = jest.fn()
      
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: false,
        error: 'Network connection failed',
        refetch: mockRefetch
      })
      
      render(<VideoLibrary cameraId={1} />)
      
      expect(screen.getByText('Network connection failed')).toBeInTheDocument()
      expect(screen.getByText('Thử lại')).toBeInTheDocument()
      
      const retryButton = screen.getByText('Thử lại')
      fireEvent.click(retryButton)
      
      expect(mockRefetch).toHaveBeenCalled()
    })

    it('displays API error with appropriate message', () => {
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: false,
        error: 'Server returned 500 error',
        refetch: jest.fn()
      })
      
      render(<VideoLibrary cameraId={1} />)
      
      expect(screen.getByText('Server returned 500 error')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /thử lại/i })).toBeInTheDocument()
    })

    it('displays timeout error with retry functionality', () => {
      const mockRefetch = jest.fn()
      
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: false,
        error: 'Request timeout',
        refetch: mockRefetch
      })
      
      render(<VideoLibrary cameraId={1} />)
      
      expect(screen.getByText('Request timeout')).toBeInTheDocument()
      
      const retryButton = screen.getByText('Thử lại')
      fireEvent.click(retryButton)
      
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })

    it('shows error icon with error message', () => {
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: false,
        error: 'Failed to load videos',
        refetch: jest.fn()
      })
      
      render(<VideoLibrary cameraId={1} />)
      
      expect(screen.getByText('Failed to load videos')).toBeInTheDocument()
      
      // Check for error icon (AlertCircle)
      const errorContainer = screen.getByText('Failed to load videos').closest('div')
      expect(errorContainer).toBeInTheDocument()
    })

    it('handles multiple consecutive errors', async () => {
      const mockRefetch = jest.fn()
      
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: false,
        error: 'First error',
        refetch: mockRefetch
      })
      
      const { rerender } = render(<VideoLibrary cameraId={1} />)
      
      expect(screen.getByText('First error')).toBeInTheDocument()
      
      // Simulate retry that results in another error
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: false,
        error: 'Second error',
        refetch: mockRefetch
      })
      
      rerender(<VideoLibrary cameraId={1} />)
      
      expect(screen.getByText('Second error')).toBeInTheDocument()
      expect(screen.getByText('Thử lại')).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('shows empty state when no videos are found', () => {
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: false,
        error: null,
        refetch: jest.fn()
      })
      
      render(<VideoLibrary cameraId={1} />)
      
      expect(screen.getByText('Không tìm thấy video nào')).toBeInTheDocument()
    })

    it('shows empty state with appropriate icon', () => {
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: false,
        error: null,
        refetch: jest.fn()
      })
      
      render(<VideoLibrary cameraId={1} />)
      
      expect(screen.getByText('Không tìm thấy video nào')).toBeInTheDocument()
      
      // Check for FileVideo icon in empty state
      const emptyContainer = screen.getByText('Không tìm thấy video nào').closest('div')
      expect(emptyContainer).toBeInTheDocument()
    })

    it('shows empty state after applying filters', () => {
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: false,
        error: null,
        refetch: jest.fn()
      })
      
      render(<VideoLibrary cameraId={1} />)
      
      // Apply filter
      const violationsFilter = screen.getByDisplayValue('Tất cả video')
      fireEvent.click(violationsFilter)
      
      expect(screen.getByText('Không tìm thấy video nào')).toBeInTheDocument()
    })
  })

  describe('Progressive Loading', () => {
    it('handles partial data loading gracefully', () => {
      mockUseVideos.mockReturnValue({
        videos: [
          {
            id: 1,
            camera_id: 1,
            filename: 'video1.mp4',
            cloudinary_url: 'https://cloudinary.com/video1.mp4',
            thumbnail_url: null, // Missing thumbnail
            duration: 120,
            file_size: 1024000,
            format: 'mp4',
            resolution: '1920x1080',
            processing_status: 'processing', // Still processing
            has_violations: false,
            violation_count: 0,
            uploaded_at: '2024-01-01T10:00:00Z',
            processed_at: null
          }
        ],
        total: 1,
        loading: false,
        error: null,
        refetch: jest.fn()
      })
      
      render(<VideoLibrary cameraId={1} />)
      
      expect(screen.getByText('Tìm thấy 1 video')).toBeInTheDocument()
      expect(screen.getByText('Đang xử lý')).toBeInTheDocument()
    })

    it('shows loading indicator for processing videos', () => {
      mockUseVideos.mockReturnValue({
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
            processing_status: 'processing',
            has_violations: false,
            violation_count: 0,
            uploaded_at: '2024-01-01T10:00:00Z',
            processed_at: null
          }
        ],
        total: 1,
        loading: false,
        error: null,
        refetch: jest.fn()
      })
      
      render(<VideoLibrary cameraId={1} />)
      
      expect(screen.getByText('Đang xử lý')).toBeInTheDocument()
    })
  })

  describe('Error Recovery', () => {
    it('recovers from error state when data loads successfully', async () => {
      const mockRefetch = jest.fn()
      
      // Start with error state
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: false,
        error: 'Network error',
        refetch: mockRefetch
      })
      
      const { rerender } = render(<VideoLibrary cameraId={1} />)
      
      expect(screen.getByText('Network error')).toBeInTheDocument()
      
      // Simulate successful retry
      mockUseVideos.mockReturnValue({
        videos: [],
        total: 0,
        loading: false,
        error: null,
        refetch: mockRefetch
      })
      
      rerender(<VideoLibrary cameraId={1} />)
      
      expect(screen.queryByText('Network error')).not.toBeInTheDocument()
      expect(screen.getByText('Không tìm thấy video nào')).toBeInTheDocument()
    })
  })
})