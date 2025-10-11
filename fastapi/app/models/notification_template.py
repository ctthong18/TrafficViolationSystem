from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean, Enum, JSON
from sqlalchemy.dialects.postgresql import JSONB, ENUM
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import enum

class NotificationType(enum.Enum):
    VIOLATION_ALERT = "violation_alert"           # Thông báo vi phạm
    PAYMENT_REMINDER = "payment_reminder"         # Nhắc nhở thanh toán
    PAYMENT_CONFIRMATION = "payment_confirmation" # Xác nhận thanh toán
    COMPLAINT_UPDATE = "complaint_update"         # Cập nhật khiếu nại
    APPEAL_RESULT = "appeal_result"               # Kết quả kháng cáo
    SYSTEM_ANNOUNCEMENT = "system_announcement"   # Thông báo hệ thống
    SECURITY_ALERT = "security_alert"             # Cảnh báo bảo mật

class NotificationTemplate(Base, TimestampMixin):
    __tablename__ = "notification_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Thông tin template
    name = Column(String(255), nullable=False)
    template_code = Column(String(100), unique=True, index=True)  # TEMP_VIOLATION_ALERT
    notification_type = Column(ENUM(NotificationType), nullable=False)
    language = Column(String(10), default="vi")  # vi, en, etc.
    
    # Nội dung template cho các kênh
    subject_template = Column(String(500))
    email_template = Column(Text)    # Template cho email
    sms_template = Column(Text)      # Template cho SMS (<= 160 chars)
    push_template = Column(Text)     # Template cho push notification
    web_template = Column(Text)      # Template cho thông báo web
    
    # Cấu hình gửi
    default_channel = Column(JSON)   # ["email", "sms"] - kênh mặc định
    is_auto_send = Column(Boolean, default=True)  # Tự động gửi?
    
    # Biến có thể thay thế
    available_variables = Column(JSON)  # {"violation_code", "license_plate", "amount", "due_date"}
    variable_description = Column(JSONB)  # {"violation_code": "Mã vi phạm", ...}
    
    # Cấu hình business rules
    trigger_condition = Column(JSONB)  # Điều kiện kích hoạt tự động
    allowed_entities = Column(JSON)    # ["violation", "payment", "complaint"]
    
    # Trạng thái
    is_active = Column(Boolean, default=True)
    version = Column(String(20), default="1.0")
    
    # Relationships
    notifications = relationship("Notification", back_populates="template")
    
    def __repr__(self):
        return f"<NotificationTemplate {self.template_code} - {self.name}>"