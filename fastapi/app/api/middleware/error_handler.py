import logging
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.exc import SQLAlchemyError
from pydantic import ValidationError

logger = logging.getLogger(__name__)

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
            
        except HTTPException as http_exc:
            # FastAPI HTTP exceptions - just re-raise
            raise http_exc
            
        except ValidationError as e:
            # Pydantic validation errors
            logger.warning(f"Validation error: {e}")
            return JSONResponse(
                status_code=422,
                content={
                    "error": "Dữ liệu không hợp lệ",
                    "details": e.errors()
                }
            )
            
        except SQLAlchemyError as e:
            # Database errors
            logger.error(f"Database error: {e}")
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Lỗi cơ sở dữ liệu",
                    "details": "Vui lòng thử lại sau"
                }
            )
            
        except Exception as e:
            # Generic unexpected errors
            logger.error(f"Unexpected error: {e}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Lỗi máy chủ nội bộ",
                    "details": "Đã xảy ra lỗi không mong muốn"
                }
            )