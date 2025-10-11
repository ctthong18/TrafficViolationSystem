from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean, Enum, JSON
from sqlalchemy.dialects.postgresql import JSONB, ENUM
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import enum

class NotificationStatus(enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    READ = "read"

class NotificationChannel(enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    APP_PUSH = "app_push"
    WEB_PUSH = "web_push"
    SYSTEM = "system"  # Thông báo trong hệ thống

class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    notification_code = Column(String(100), unique=True, index=True)  # TB-2024-001
    
    # Liên kết với template (nếu có)
    template_id = Column(Integer, ForeignKey("notification_templates.id"))
    
    # Người nhận
    recipient_id = Column(Integer, ForeignKey("users.id"))  # Người dùng hệ thống
    recipient_name = Column(String(255))  # Tên người nhận (nếu không có account)
    recipient_email = Column(String(255))
    recipient_phone = Column(String(20))
    
    # Nội dung thông báo
    title = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)
    short_message = Column(String(500))  # Cho SMS/push notification
    
    # Kênh gửi và trạng thái
    channel = Column(ENUM(NotificationChannel), nullable=False)
    status = Column(ENUM(NotificationStatus), default=NotificationStatus.PENDING)
    priority = Column(String(20), default="medium")  # low, medium, high, urgent
    
    # Liên kết với các entity khác
    violation_id = Column(Integer, ForeignKey("violations.id"))
    payment_id = Column(Integer, ForeignKey("payments.id"))
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    
    # Metadata gửi
    scheduled_at = Column(DateTime)  # Lên lịch gửi
    sent_at = Column(DateTime)
    read_at = Column(DateTime)
    
    # Phản hồi từ gateway
    gateway_message_id = Column(String(255))  # ID từ email/SMS gateway
    gateway_response = Column(JSONB)  # Full response từ gateway
    delivery_attempts = Column(Integer, default=0)
    last_attempt_at = Column(DateTime)
    error_message = Column(Text)
    
    # Dữ liệu động được sử dụng
    template_variables = Column(JSONB)  # {"license_plate": "51A-123.45", "amount": "500000"}
    
    # Relationships
    template = relationship("NotificationTemplate", back_populates="notifications")
    recipient = relationship("User", foreign_keys=[recipient_id])
    violation = relationship("Violation", back_populates="notifications")
    payment = relationship("Payment")
    complaint = relationship("Complaint")
    
    def __repr__(self):
        return f"<Notification {self.notification_code} to {self.recipient_email}>"