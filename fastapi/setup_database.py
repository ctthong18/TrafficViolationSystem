import os
import sys
import psycopg2
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy.orm import sessionmaker

# Import cấu hình
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.core.config import settings
from app.models.base import Base
from app.models import (
    user, vehicle, violation, driving_license,
    complaint, complaint_appeal, complaint_activity,
    audit_log, payment, notification,
    notification_template, system_config,
    camera, confidence_analytics, model_performance,
    daily_stats, location_hotspots, time_series_trends,
    action_recommendations, denunciation,
    denunciation_activity, violation_forecasts
)
from app.models.user import User, Role
from datetime import datetime
from passlib.hash import bcrypt
from app.seed_data import seed_core_data


def create_admin_user(db):
    print("\n Tạo admin user...")
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            print("Admin user đã tồn tại.")
            return
        
        raw_password = "admin123"  
        pw_bytes = raw_password.encode("utf-8")
        if len(pw_bytes) > 72:
            pw_bytes = pw_bytes[:72]                       # cắt theo bytes
            raw_password = pw_bytes.decode("utf-8", "ignore")  

        password_hash = bcrypt.hash(raw_password)
        admin = User(
            username="admin",
            email="admin@traffic.local",
            password_hash=password_hash,
            full_name="System Administrator",
            role=Role.ADMIN.value,
            permissions={"all": True},
            is_active=True,
            created_at=datetime.utcnow(),
        )
        db.add(admin)
        db.commit()
        print("Đã tạo admin user mặc định (username: admin / password: admin123)")
    except Exception as e:
        db.rollback()
        print(f"Lỗi tạo admin user: {e}")


def main():
    print("Bắt đầu setup database cho Traffic Violation System")
    print("=" * 60)

    db_url = settings.DATABASE_URL
    print(f"\nKiểm tra kết nối PostgreSQL...")
    try:
        conn = psycopg2.connect(db_url) 
        conn.close()
        print("Kết nối PostgreSQL thành công!")
    except Exception as e:
        print(f"Lỗi kết nối PostgreSQL: {e}")
        return

    print("\nTạo database...")
    engine = create_engine(db_url, echo=False)
    if not database_exists(engine.url):
        create_database(engine.url)
        print("Đã tạo mới database.")
    else:
        print("Database đã tồn tại")

    print("\n Tạo các bảng...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Đã tạo tất cả các bảng trong database")
    except Exception as e:
        print(f"Lỗi khi tạo bảng: {e}")
        return

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    create_admin_user(db)
    # Seed core sample data (idempotent)
    print("\nSeed dữ liệu mẫu (rules, violations, payments, templates, configs, cameras)...")
    try:
        seed_core_data()
        print("Đã seed dữ liệu mẫu.")
    except Exception as e:
        print(f"Lỗi seed dữ liệu: {e}")
    db.close()

    print("\n Hoàn tất setup database!")


if __name__ == "__main__":
    main()
