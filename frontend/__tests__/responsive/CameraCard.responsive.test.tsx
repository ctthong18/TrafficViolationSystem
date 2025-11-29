import { render, screen } from '@testing-library/react'
import { CameraCard } from '@/components/camera-system/CameraCard'
import { Camera } from '@/lib/api'

// Mock data
const mockCamera = {
  id: 'CAM001',
  name: 'Camera Ngã Tư Lê Lợi',
  location: '123 Đường Lê Lợi, Quận 1, TP.HCM',
  status: 'online',
  violations: 5,
  lastUpdate: '10:30 AM'
}

const mockRawCamera: Camera = {
  id: 1,
  camera_id: 'CAM001',
  name: 'Camera Ngã Tư Lê Lợi',
  location_name: '123 Đường Lê Lợi, Quận 1, TP.HCM',
  address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
  status: 'online',
  violations_today: 5,
  ai_model_version: 'v2.1',
  confidence_threshold: 0.8,
  enabled_detections: { vehicle: true, person: true },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockProps = {
  camera: mockCamera,
  rawCameras: [mockRawCamera],
  onViewLive: jest.fn(),
  onEditCamera: jest.fn(),
  onDeleteCamera: jest.fn(),
  onUpdateStatus: jest.fn(),
  onEditAIConfig: jest.fn(),
  onViewDetails: jest.fn(),
  onMaintenance: jest.fn()
}

// Helper function to set viewport size
const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  
  // Update matchMedia mock for responsive breakpoints
  window.matchMedia = jest.fn().mockImplementation(query => {
    const mediaQuery = query.replace(/[()]/g, '')
    let matches = false
    
    if (mediaQuery.includes('max-width: 768px')) {
      matches = width <= 768
    } else if (mediaQuery.includes('min-width: 769px') && mediaQuery.includes('max-width: 1024px')) {
      matches = width >= 769 && width <= 1024
    } else if (mediaQuery.includes('min-width: 1025px')) {
      matches = width >= 1025
    }
    
    return {
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }
  })
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'))
}

describe('CameraCard Responsive Design', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Mobile Layout (< 768px)', () => {
    beforeEach(() => {
      setViewportSize(375, 667) // iPhone SE dimensions
    })

    it('renders correctly on mobile screens', () => {
      render(<CameraCard {...mockProps} />)
      
      // Basic elements should still be visible
      expect(screen.getByText('CAM001')).toBeInTheDocument()
      expect(screen.getByText('Camera Ngã Tư Lê Lợi')).toBeInTheDocument()
      expect(screen.getByText('Hoạt động')).toBeInTheDocument()
    })

    it('maintains button functionality on mobile', () => {
      render(<CameraCard {...mockProps} />)
      
      const liveButton = screen.getByText('Xem live')
      expect(liveButton).toBeInTheDocument()
      
      const settingsButton = screen.getByRole('button', { name: /settings/i })
      expect(settingsButton).toBeInTheDocument()
    })

    it('displays location text appropriately for mobile', () => {
      render(<CameraCard {...mockProps} />)
      
      // Location should be visible but may be truncated
      expect(screen.getByText('123 Đường Lê Lợi, Quận 1, TP.HCM')).toBeInTheDocument()
    })
  })

  describe('Tablet Layout (768px - 1024px)', () => {
    beforeEach(() => {
      setViewportSize(768, 1024) // iPad dimensions
    })

    it('renders correctly on tablet screens', () => {
      render(<CameraCard {...mockProps} />)
      
      expect(screen.getByText('CAM001')).toBeInTheDocument()
      expect(screen.getByText('Camera Ngã Tư Lê Lợi')).toBeInTheDocument()
      expect(screen.getByText('123 Đường Lê Lợi, Quận 1, TP.HCM')).toBeInTheDocument()
    })

    it('shows all information clearly on tablet', () => {
      render(<CameraCard {...mockProps} />)
      
      expect(screen.getByText('Vi phạm hôm nay')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('Cập nhật cuối')).toBeInTheDocument()
      expect(screen.getByText('10:30 AM')).toBeInTheDocument()
    })
  })

  describe('Desktop Layout (> 1024px)', () => {
    beforeEach(() => {
      setViewportSize(1920, 1080) // Full HD desktop
    })

    it('renders correctly on desktop screens', () => {
      render(<CameraCard {...mockProps} />)
      
      expect(screen.getByText('CAM001')).toBeInTheDocument()
      expect(screen.getByText('Camera Ngã Tư Lê Lợi')).toBeInTheDocument()
      expect(screen.getByText('123 Đường Lê Lợi, Quận 1, TP.HCM')).toBeInTheDocument()
    })

    it('displays all elements with full spacing on desktop', () => {
      render(<CameraCard {...mockProps} />)
      
      // All elements should be clearly visible
      expect(screen.getByText('Vi phạm hôm nay')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('Cập nhật cuối')).toBeInTheDocument()
      expect(screen.getByText('10:30 AM')).toBeInTheDocument()
      expect(screen.getByText('Xem live')).toBeInTheDocument()
    })

    it('shows hover interactions on desktop', () => {
      render(<CameraCard {...mockProps} />)
      
      const card = screen.getByText('CAM001').closest('.relative')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Text Truncation and Overflow', () => {
    it('handles very long camera names', () => {
      const longNameCamera = {
        ...mockCamera,
        name: 'Camera Ngã Tư Lê Lợi Phường Bến Nghé Quận 1 Thành Phố Hồ Chí Minh Việt Nam'
      }
      
      render(<CameraCard {...mockProps} camera={longNameCamera} />)
      
      expect(screen.getByText(longNameCamera.name)).toBeInTheDocument()
    })

    it('handles very long location names', () => {
      const longLocationCamera = {
        ...mockCamera,
        location: 'Số 123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, Thành Phố Hồ Chí Minh, Việt Nam, Đông Nam Á'
      }
      
      render(<CameraCard {...mockProps} camera={longLocationCamera} />)
      
      expect(screen.getByText(longLocationCamera.location)).toBeInTheDocument()
    })
  })

  describe('Status Indicators Visibility', () => {
    it('shows status indicators clearly across all screen sizes', () => {
      const screenSizes = [
        [375, 667],   // Mobile
        [768, 1024],  // Tablet
        [1920, 1080]  // Desktop
      ]
      
      screenSizes.forEach(([width, height]) => {
        setViewportSize(width, height)
        
        const { unmount } = render(<CameraCard {...mockProps} />)
        
        expect(screen.getByText('Hoạt động')).toBeInTheDocument()
        
        unmount()
      })
    })
  })

  describe('Button Layout Responsiveness', () => {
    it('maintains button accessibility across screen sizes', () => {
      const screenSizes = [
        [375, 667],   // Mobile
        [768, 1024],  // Tablet
        [1920, 1080]  // Desktop
      ]
      
      screenSizes.forEach(([width, height]) => {
        setViewportSize(width, height)
        
        const { unmount } = render(<CameraCard {...mockProps} />)
        
        const liveButton = screen.getByText('Xem live')
        const settingsButton = screen.getByRole('button', { name: /settings/i })
        
        expect(liveButton).toBeInTheDocument()
        expect(settingsButton).toBeInTheDocument()
        
        unmount()
      })
    })
  })
})