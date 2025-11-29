from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def validate_password_strength(password: str) -> dict:
    errors = []
    
    if len(password) < 8:
        errors.append("Mật khẩu phải có ít nhất 8 ký tự")
    
    if not any(c.isupper() for c in password):
        errors.append("Mật khẩu phải có ít nhất 1 chữ hoa")
    
    if not any(c.islower() for c in password):
        errors.append("Mật khẩu phải có ít nhất 1 chữ thường")
    
    if not any(c.isdigit() for c in password):
        errors.append("Mật khẩu phải có ít nhất 1 chữ số")
    
    return {
        "is_valid": len(errors) == 0,
        "errors": errors
    }