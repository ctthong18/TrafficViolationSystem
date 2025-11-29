import { render, screen, fireEvent } from '@testing-library/react'
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

describe('CameraCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders camera information correctly', () => {
    render(<CameraCard {...mockProps} />)
    
    expect(screen.getByText('CAM001')).toBeInTheDocument()
    expect(screen.getByText('Camera Ngã Tư Lê Lợi')).toBeInTheDocument()
    expect(screen.getByText('123 Đường Lê Lợi, Quận 1, TP.HCM')).toBeInTheDocument()
    expect(screen.getByText('Hoạt động')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('10:30 AM')).toBeInTheDocument()
  })

  it('displays correct status badge for online camera', () => {
    render(<CameraCard {...mockProps} />)
    
    const statusBadge = screen.getByText('Hoạt động')
    expect(statusBadge).toBeInTheDocument()
  })

  it('displays correct status badge for offline camera', () => {
    const offlineCamera = { ...mockCamera, status: 'offline' }
    const offlineRawCamera = { ...mockRawCamera, status: 'offline' }
    
    render(
      <CameraCard 
        {...mockProps} 
        camera={offlineCamera}
        rawCameras={[offlineRawCamera]}
      />
    )
    
    expect(screen.getByText('Ngoại tuyến')).toBeInTheDocument()
  })

  it('displays correct status badge for maintenance camera', () => {
    const maintenanceCamera = { ...mockCamera, status: 'maintenance' }
    const maintenanceRawCamera = { ...mockRawCamera, status: 'maintenance' }
    
    render(
      <CameraCard 
        {...mockProps} 
        camera={maintenanceCamera}
        rawCameras={[maintenanceRawCamera]}
      />
    )
    
    expect(screen.getByText('Bảo trì')).toBeInTheDocument()
  })

  it('calls onViewLive when live view button is clicked', () => {
    render(<CameraCard {...mockProps} />)
    
    const liveButton = screen.getByText('Xem live')
    fireEvent.click(liveButton)
    
    expect(mockProps.onViewLive).toHaveBeenCalledWith(mockRawCamera)
  })

  it('opens settings dropdown when settings button is clicked', () => {
    render(<CameraCard {...mockProps} />)
    
    // Find the settings button by its SVG content (since it has no accessible name)
    const buttons = screen.getAllByRole('button')
    const settingsButton = buttons.find(button => 
      button.querySelector('svg.lucide-settings')
    )
    expect(settingsButton).toBeInTheDocument()
    
    fireEvent.click(settingsButton!)
    
    expect(screen.getByText('Cài đặt camera')).toBeInTheDocument()
    expect(screen.getByText('Chỉnh sửa thông tin')).toBeInTheDocument()
    expect(screen.getByText('Cấu hình AI')).toBeInTheDocument()
    expect(screen.getByText('Cập nhật bảo trì')).toBeInTheDocument()
    expect(screen.getByText('Xem chi tiết')).toBeInTheDocument()
    expect(screen.getByText('Xóa camera')).toBeInTheDocument()
  })

  it('calls onEditCamera when edit option is clicked', () => {
    render(<CameraCard {...mockProps} />)
    
    const buttons = screen.getAllByRole('button')
    const settingsButton = buttons.find(button => 
      button.querySelector('svg.lucide-settings')
    )
    fireEvent.click(settingsButton!)
    
    const editButton = screen.getByText('Chỉnh sửa thông tin')
    fireEvent.click(editButton)
    
    expect(mockProps.onEditCamera).toHaveBeenCalledWith(mockRawCamera)
  })

  it('calls onUpdateStatus when status change option is clicked', () => {
    render(<CameraCard {...mockProps} />)
    
    const buttons = screen.getAllByRole('button')
    const settingsButton = buttons.find(button => 
      button.querySelector('svg.lucide-settings')
    )
    fireEvent.click(settingsButton!)
    
    const statusButton = screen.getByText('Đặt trạng thái: Ngoại tuyến')
    fireEvent.click(statusButton)
    
    expect(mockProps.onUpdateStatus).toHaveBeenCalledWith(mockRawCamera, 'offline')
  })

  it('calls onDeleteCamera when delete option is clicked', () => {
    render(<CameraCard {...mockProps} />)
    
    const buttons = screen.getAllByRole('button')
    const settingsButton = buttons.find(button => 
      button.querySelector('svg.lucide-settings')
    )
    fireEvent.click(settingsButton!)
    
    const deleteButton = screen.getByText('Xóa camera')
    fireEvent.click(deleteButton)
    
    expect(mockProps.onDeleteCamera).toHaveBeenCalledWith(mockRawCamera)
  })

  it('handles missing camera data gracefully', () => {
    const incompleteCameraData = {
      id: 'CAM002',
      name: '',
      location: '',
      status: 'unknown',
      violations: 0,
      lastUpdate: ''
    }
    
    render(
      <CameraCard 
        {...mockProps} 
        camera={incompleteCameraData}
        rawCameras={[]}
      />
    )
    
    expect(screen.getByText('CAM002')).toBeInTheDocument()
    expect(screen.getByText('Không xác định')).toBeInTheDocument()
  })

  it('shows correct icon for online status', () => {
    render(<CameraCard {...mockProps} />)
    
    const liveButton = screen.getByText('Xem live')
    expect(liveButton.closest('button')).toBeInTheDocument()
  })

  it('shows correct icon for offline status', () => {
    const offlineCamera = { ...mockCamera, status: 'offline' }
    const offlineRawCamera = { ...mockRawCamera, status: 'offline' }
    
    render(
      <CameraCard 
        {...mockProps} 
        camera={offlineCamera}
        rawCameras={[offlineRawCamera]}
      />
    )
    
    const liveButton = screen.getByText('Xem live')
    expect(liveButton.closest('button')).toBeInTheDocument()
  })
})