from pydantic import BaseModel, EmailStr, Field
from typing import Optional
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username_or_email: str
    password: str
    identification_number: Optional[str] = Field(
        None, description="Chỉ bắt buộc cho citizen"
    )

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "citizen"
    identification_number: Optional[str] = Field(None, description="Chỉ bắt buộc cho citizen")
    phone_number: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str