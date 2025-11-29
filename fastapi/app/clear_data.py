from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.driving_license import DrivingLicense
from app.models.violation import Violation
from app.models.payment import Payment
from app.models.notification_template import NotificationTemplate
from app.models.system_config import SystemConfig
from app.models.violation_rule import ViolationRule
from app.models.camera import Camera

def clear_seed_data():
    db: Session = SessionLocal()
    try:
        # Lưu ý: thứ tự xóa phải đúng để không vi phạm FK
        db.query(Payment).delete()  # nếu muốn xóa các payment liên quan
        db.query(Violation).delete()
        db.query(Camera).delete()
        db.commit()
        print("Đã xóa toàn bộ dữ liệu seed.")
    finally:
        db.close()
        
if __name__ == "__main__":
    clear_seed_data()

