"""FastAPI 의존성 주입 정의."""
from __future__ import annotations

from typing import Annotated, Optional

from fastapi import Cookie, Depends
from jose import JWTError
from sqlmodel import Session

from app.auth.jwt import ACCESS_TOKEN_TYPE, decode_token
from app.core.database import get_db
from app.core.exceptions import UnauthorizedException
from app.core.logging_config import logger
from app.crud import get_user_by_id
from app.models import Users

SessionDep = Annotated[Session, Depends(get_db)]

ACCESS_COOKIE_NAME = "access_token"
REFRESH_COOKIE_NAME = "refresh_token"


def _resolve_user_from_cookie(
    db: Session, access_token: Optional[str], strict: bool
) -> Optional[Users]:
    """access_token 쿠키 → Users 조회.

    Args:
        strict: True 면 어떤 단계든 실패 시 ``UnauthorizedException`` 발생.
                False 면 토큰이 아예 없을 때만 ``None`` 반환하고, 토큰이 있는데
                만료/위조면 여전히 401 (의도적인 invalid 토큰은 사용자에게 알림).
    """
    if not access_token:
        if strict:
            raise UnauthorizedException(detail="로그인이 필요합니다.")
        return None

    try:
        payload = decode_token(access_token, expected_type=ACCESS_TOKEN_TYPE)
    except UnauthorizedException:
        if strict:
            raise
        return None
    except JWTError:
        if strict:
            raise UnauthorizedException(detail="유효하지 않은 인증 정보입니다.")
        return None

    sub = payload.get("sub")
    if sub is None:
        if strict:
            raise UnauthorizedException(detail="유효하지 않은 토큰입니다.")
        return None

    try:
        user_id = int(sub)
    except (TypeError, ValueError):
        if strict:
            raise UnauthorizedException(detail="유효하지 않은 사용자 식별자입니다.")
        return None

    user = get_user_by_id(db, user_id)
    if user is None:
        logger.info(f"토큰의 사용자 {user_id} 가 DB 에 존재하지 않음")
        if strict:
            raise UnauthorizedException(detail="존재하지 않는 사용자입니다.")
        return None

    return user


def get_current_user(
    db: SessionDep,
    access_token: Annotated[Optional[str], Cookie(alias=ACCESS_COOKIE_NAME)] = None,
) -> Users:
    """로그인 강제: 비인증 시 ``UnauthorizedException``."""
    user = _resolve_user_from_cookie(db, access_token, strict=True)
    assert user is not None  # strict=True 면 여기서 None 일 수 없음
    return user


def get_optional_user(
    db: SessionDep,
    access_token: Annotated[Optional[str], Cookie(alias=ACCESS_COOKIE_NAME)] = None,
) -> Optional[Users]:
    """선택적 로그인: 쿠키가 없거나 디코딩 실패면 ``None``.

    공개 페이지에서 "로그인 상태이면 추가 정보 표시" 용도로 사용한다.
    이 의존성은 401 을 발생시키지 않으므로 비로그인 사용자에게도 200 응답을 줄 수 있다.
    """
    return _resolve_user_from_cookie(db, access_token, strict=False)


CurrentUser = Annotated[Users, Depends(get_current_user)]
OptionalUser = Annotated[Optional[Users], Depends(get_optional_user)]
