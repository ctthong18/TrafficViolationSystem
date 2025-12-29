from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User
from app.schemas.user_schema import Role
from app.services.user_service import UserService

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    print("Authorization Header:", credentials)
    username = verify_token(token)

    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã hết hạn",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_service = UserService(db)
    try:
        user = user_service.get_user_by_username(username)
    except HTTPException:
        # Check if it's a camera
        from app.models.camera import Camera
        camera = db.query(Camera).filter(Camera.camera_id == username).first()
        if camera:
            user = User(
                id=camera.id,
                username=camera.camera_id,
                email=f"{camera.camera_id}@camera.system",
                full_name=camera.name,
                role=Role.CAMERA.value,
                identification_number=camera.camera_id,
                is_active=True
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Người dùng không tồn tại"
            )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản đã bị vô hiệu hóa",
        )

    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Tài khoản không hoạt động"
        )
    return current_user


def require_role(required_role: Role):
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if (
            current_user.role != required_role and current_user.role != Role.ADMIN  # type: ignore
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Yêu cầu quyền {required_role} để truy cập",
            )
        return current_user

    return role_checker


def require_roles(required_roles: list):
    def roles_checker(current_user: User = Depends(get_current_active_user)):
        if (
            current_user.role not in required_roles and current_user.role != Role.ADMIN  # type: ignore
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Yêu cầu một trong các quyền: {', '.join(required_roles)}",
            )
        return current_user

    return roles_checker
