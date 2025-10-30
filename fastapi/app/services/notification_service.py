from sqlalchemy.orm import Session
from app.models.notification import Notification

class NotificationService:
    def __init__(self, db: Session):
        self.db = db
    
    def send_violation_notification(self, violation_id: int):
        # Gửi thông báo vi phạm
        pass
    
    def send_payment_reminder(self, payment_id: int):
        # Gửi nhắc nhở thanh toán
        pass