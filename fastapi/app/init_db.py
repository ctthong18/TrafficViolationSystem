from app.core.database import Base, engine, SessionLocal
from app.models import *
from app.models.user import User, UserRole
from datetime import datetime
from sqlalchemy.exc import IntegrityError

def init_db():
    print("🔧 Creating tables in database...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully.")

    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == UserRole.admin).first()
        if not admin:
            admin = User(
                full_name="Cơ quan cấp cao",
                email="admin@phatnguoi.gov.vn",
                password="admin123",  
                phone="0123456789",
                role=UserRole.admin,
                is_active=True,
                created_at=datetime.utcnow(),
            )
            db.add(admin)
            db.commit()
            print("Created default admin account.")
        else:
            print("Admin account already exists.")
    except IntegrityError:
        db.rollback()
        print("Admin creation failed due to duplication.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
