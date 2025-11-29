from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError
from app.core.database import Base, engine, SessionLocal
from app.models import *
from app.models.user import User, Role
from passlib.hash import bcrypt

def init_db():
    print("Creating tables in database...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    db = SessionLocal()
    try:
        # Kiểm tra xem đã có admin chưa
        admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            print("Creating default admin account...")

            password = "admin123"
            if len(password.encode("utf-8")) > 72:
                password = password[:72]

            admin = User(
                username="admin",
                full_name="Cơ quan cấp cao",
                email="admin@phatnguoi.gov.vn",
                password_hash=bcrypt.hash(password),
                phone_number="0123456789",
                role="admin",
                identification_number="000000000000",  
                is_active=True,
                created_at=datetime.now(timezone.utc),
            )

            db.add(admin)
            db.commit()
            print("Created default admin account successfully.")
        else:
            print("ℹAdmin account already exists.")
    except IntegrityError as e:
        db.rollback()
        print("Admin creation failed due to duplication:", e)
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
