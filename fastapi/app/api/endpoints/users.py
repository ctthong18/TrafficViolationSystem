from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User

router = APIRouter()

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "full_name": u.full_name,
            "identification_number": u.identification_number,
            "role": u.role,
            "is_active": u.is_active,
        }
        for u in users
    ]
