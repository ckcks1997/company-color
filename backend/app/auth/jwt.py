"""JWT 토큰 생성/검증 유틸리티.

access 토큰 (짧음) 과 refresh 토큰 (길음) 을 분리해 발급한다.
payload 의 ``token_type`` 클레임으로 둘을 구분한다.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from fastapi import HTTPException, status
from jose import JWTError, jwt

from app.core.config import settings
from app.core.logging_config import logger

ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"


def _ensure_secret() -> str:
    secret = settings["SECRET_KEY"]
    if not secret:
        logger.error("SECRET_KEY 가 설정되지 않았습니다 — JWT 발급/검증이 실패합니다.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="서버 설정 오류 (SECRET_KEY 누락)",
        )
    return secret


def _create_token(data: Dict[str, Any], token_type: str, expires_delta: timedelta) -> str:
    secret = _ensure_secret()
    now = datetime.now(timezone.utc)
    payload = {
        **data,
        "iat": now,
        "exp": now + expires_delta,
        "token_type": token_type,
    }
    try:
        return jwt.encode(payload, secret, algorithm=settings["JWT_ALGORITHM"])
    except Exception as e:
        logger.error(f"JWT 인코딩 오류: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="토큰 생성 중 오류가 발생했습니다.",
        )


def create_access_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """짧은 수명의 access 토큰 발급."""
    delta = expires_delta or timedelta(
        minutes=int(settings["ACCESS_TOKEN_EXPIRE_MINUTES"])
    )
    return _create_token(data, ACCESS_TOKEN_TYPE, delta)


def create_refresh_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """긴 수명의 refresh 토큰 발급."""
    delta = expires_delta or timedelta(days=int(settings["REFRESH_TOKEN_EXPIRE_DAYS"]))
    return _create_token(data, REFRESH_TOKEN_TYPE, delta)


def decode_token(token: str, expected_type: Optional[str] = None) -> Dict[str, Any]:
    """JWT 디코딩 + 만료/타입 검증.

    Args:
        token: 검증할 토큰 문자열.
        expected_type: ``access`` 또는 ``refresh`` 로 토큰 종류를 강제할 때 지정.

    Raises:
        HTTPException(401): 토큰이 없거나, 만료됐거나, 서명/타입이 유효하지 않을 때.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증이 필요합니다.",
        )

    secret = _ensure_secret()
    try:
        payload = jwt.decode(token, secret, algorithms=[settings["JWT_ALGORITHM"]])
    except JWTError as e:
        logger.info(f"JWT 디코딩 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 인증 정보입니다.",
        )

    if expected_type is not None and payload.get("token_type") != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 토큰 종류입니다.",
        )

    return payload


# --- 하위 호환 ---
def get_token_data(token: str) -> Dict[str, Any]:
    """기존 코드 호환: access 토큰을 디코딩."""
    return decode_token(token, expected_type=ACCESS_TOKEN_TYPE)


def validate_access_token(token: str) -> Dict[str, Any]:
    """기존 코드 호환."""
    return decode_token(token, expected_type=ACCESS_TOKEN_TYPE)
