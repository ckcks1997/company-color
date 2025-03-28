"""
JWT 인증 관련 유틸리티 모듈
"""
from fastapi import HTTPException, status
from jose import jwt, JWTError
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.logging_config import logger
from typing import Dict, Optional

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    JWT 액세스 토큰을 생성합니다.
    
    Args:
        data: 토큰에 인코딩할 데이터
        expires_delta: 토큰 만료 시간(기본값: 설정 값)
        
    Returns:
        생성된 JWT 토큰
    """
    to_encode = data.copy()
    
    # 만료 시간 설정
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=int(settings["ACCESS_TOKEN_EXPIRE_MINUTES"]))
        
    to_encode.update({"exp": expire})
    to_encode.update({"iat": datetime.utcnow()})  # 발급 시간
    
    try:
        encoded_jwt = jwt.encode(
            to_encode, 
            settings["SECRET_KEY"], 
            algorithm=settings["ALGORITHM"]
        )
        return encoded_jwt
    except Exception as e:
        logger.error(f"JWT 토큰 생성 오류: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="토큰 생성 중 오류가 발생했습니다."
        )


def get_token_data(token: str) -> Dict:
    """
    JWT 토큰을 디코딩하여 데이터를 추출합니다.
    
    Args:
        token: JWT 토큰
        
    Returns:
        디코딩된 토큰 데이터
        
    Raises:
        HTTPException: 토큰이 유효하지 않거나 만료된 경우
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증이 필요합니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    try:
        decoded_jwt = jwt.decode(
            token, 
            settings["SECRET_KEY"], 
            algorithms=[settings["ALGORITHM"]]
        )
        
        # 토큰 만료 확인
        exp_timestamp = decoded_jwt.get('exp')
        if not exp_timestamp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="유효하지 않은 토큰 형식입니다.",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        exp_datetime = datetime.fromtimestamp(exp_timestamp)
        now = datetime.utcnow()

        if now >= exp_datetime:
            logger.warning(f"만료된 토큰 사용 시도: sub={decoded_jwt.get('sub', 'unknown')}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="토큰이 만료되었습니다.",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return decoded_jwt
        
    except JWTError as e:
        logger.warning(f"JWT 디코딩 오류: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 인증 정보입니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"토큰 처리 중 예상치 못한 오류: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="인증 처리 중 오류가 발생했습니다."
        )


def validate_access_token(token: str) -> Dict:
    """
    JWT 토큰의 유효성을 검사합니다.
    (하위 호환성 유지를 위한 함수)
    
    Args:
        token: JWT 토큰
        
    Returns:
        디코딩된 토큰 데이터
        
    Raises:
        HTTPException: 토큰이 유효하지 않거나 만료된 경우
    """
    return get_token_data(token)
