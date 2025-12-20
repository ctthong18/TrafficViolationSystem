from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
from datetime import datetime

class AILog(Base, TimestampMixin):
    """
    Model để lưu logs kết quả AI detection
    """
    __tablename__ = "ai_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Liên kết với camera
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False, index=True)
    
    # Thông tin video/frame
    video_path = Column(String(500), nullable=True)  # Đường dẫn video gốc
    frame_number = Column(Integer, nullable=True)    # Số frame trong video
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)  # Thời gian detection
    
    # Kết quả AI detection
    detection_type = Column(String(50), nullable=False)  # vehicle, license_plate, violation
    confidence_score = Column(Float, nullable=True)      # Độ tin cậy (0-1)
    
    # Bounding box coordinates (x, y, width, height)
    bbox_x = Column(Float, nullable=True)
    bbox_y = Column(Float, nullable=True) 
    bbox_width = Column(Float, nullable=True)
    bbox_height = Column(Float, nullable=True)
    
    # Thông tin chi tiết (JSON)
    detection_data = Column(JSON, nullable=True)  # Lưu thêm thông tin chi tiết
    
    # Kết quả nhận dạng
    license_plate = Column(String(20), nullable=True)    # Biển số xe (nếu có)
    vehicle_type = Column(String(50), nullable=True)     # Loại xe
    violation_type = Column(String(100), nullable=True)  # Loại vi phạm
    
    # Trạng thái xử lý
    is_processed = Column(Boolean, default=False)        # Đã xử lý chưa
    is_violation = Column(Boolean, default=False)        # Có phải vi phạm không
    
    # Metadata
    model_version = Column(String(50), nullable=True)    # Phiên bản model AI
    processing_time = Column(Float, nullable=True)       # Thời gian xử lý (ms)
    
    # Relationships
    camera = relationship("Camera", back_populates="ai_logs")
    
    def __repr__(self):
        return f"<AILog(id={self.id}, camera_id={self.camera_id}, type={self.detection_type})>"
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "camera_id": self.camera_id,
            "video_path": self.video_path,
            "frame_number": self.frame_number,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "detection_type": self.detection_type,
            "confidence_score": self.confidence_score,
            "bbox": {
                "x": self.bbox_x,
                "y": self.bbox_y,
                "width": self.bbox_width,
                "height": self.bbox_height
            } if self.bbox_x is not None else None,
            "detection_data": self.detection_data,
            "license_plate": self.license_plate,
            "vehicle_type": self.vehicle_type,
            "violation_type": self.violation_type,
            "is_processed": self.is_processed,
            "is_violation": self.is_violation,
            "model_version": self.model_version,
            "processing_time": self.processing_time,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }