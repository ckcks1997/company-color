from fastapi import HTTPException, status, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.core.logging_config import logger

class ErrorResponse(BaseModel):
    """API 오류 응답 모델"""
    status_code: int
    detail: str
    error_code: Optional[str] = None
    path: Optional[str] = None
    timestamp: Optional[str] = None


class CustomHTTPException(HTTPException):
    """커스텀 HTTP 예외"""
    def __init__(
        self, 
        status_code: int, 
        detail: str, 
        error_code: Optional[str] = None,
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code


# 비즈니스 로직 관련 예외
class BusinessException(CustomHTTPException):
    """비즈니스 로직 관련 예외"""
    def __init__(self, detail: str, error_code: Optional[str] = None):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail, error_code=error_code)


class UnauthorizedException(CustomHTTPException):
    """인증 관련 예외"""
    def __init__(self, detail: str = "인증이 필요합니다.", error_code: Optional[str] = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=detail, 
            error_code=error_code,
            headers={"WWW-Authenticate": "Bearer"}
        )


class NotFoundException(CustomHTTPException):
    """리소스를 찾을 수 없는 경우의 예외"""
    def __init__(self, detail: str, error_code: Optional[str] = None):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail, error_code=error_code)


class ExternalAPIException(CustomHTTPException):
    """외부 API 관련 예외"""
    def __init__(self, detail: str, error_code: Optional[str] = None):
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail, error_code=error_code)


# 예외 핸들러
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    HTTP 예외 핸들러
    
    Args:
        request: FastAPI 요청 객체
        exc: 발생한 HTTP 예외
        
    Returns:
        JSONResponse: 표준화된 오류 응답
    """
    from datetime import datetime
    
    error_code = getattr(exc, "error_code", None)
    status_code = exc.status_code
    
    # 로깅
    log_level = logging.WARNING if status_code < 500 else logging.ERROR
    logger.log(
        log_level,
        f"HTTP Exception: {status_code} - {exc.detail} - Path: {request.url.path}"
    )
    
    # 응답 생성
    response = ErrorResponse(
        status_code=status_code,
        detail=exc.detail,
        error_code=error_code,
        path=request.url.path,
        timestamp=datetime.now().isoformat()
    )
    
    return JSONResponse(
        status_code=status_code,
        content=response.dict(exclude_none=True),
        headers=exc.headers or {}
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    일반 예외 핸들러
    
    Args:
        request: FastAPI 요청 객체
        exc: 발생한 예외
        
    Returns:
        JSONResponse: 표준화된 오류 응답
    """
    from datetime import datetime
    import traceback
    
    # 로깅
    logger.error(
        f"Unhandled exception: {str(exc)} - Path: {request.url.path}\n{traceback.format_exc()}"
    )
    
    # 응답 생성
    response = ErrorResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="내부 서버 오류가 발생했습니다.",
        path=request.url.path,
        timestamp=datetime.now().isoformat()
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=response.dict(exclude_none=True)
    )


# 의존성 설정
import logging
