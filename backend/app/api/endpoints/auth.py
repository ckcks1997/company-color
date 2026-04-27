"""인증/카카오 OAuth 엔드포인트.

흐름:
1. ``GET /auth/kakao/login`` → 카카오 인가 페이지로 302 리다이렉트.
2. 사용자가 동의하면 카카오 → ``GET /auth/kakao/callback?code=...`` 호출.
3. 백엔드: 카카오에서 토큰 교환 → 사용자 정보 조회 → Users upsert →
   JWT access/refresh 발급 → httpOnly 쿠키로 설정 → 프론트로 302.
4. 프론트는 쿠키만으로 인증 — JS 에서 토큰을 직접 다루지 않는다.
"""
from __future__ import annotations

from typing import Any, Dict
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Cookie, Response, status
from fastapi.responses import RedirectResponse

from app.api.deps import (
    ACCESS_COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    OptionalUser,
    SessionDep,
)
from app.auth.jwt import (
    REFRESH_TOKEN_TYPE,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import settings
from app.core.exceptions import ExternalAPIException, UnauthorizedException
from app.core.logging_config import logger
from app.crud import get_or_create_user
from app.models import Users

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize"
KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token"
KAKAO_USER_URL = "https://kapi.kakao.com/v2/user/me"


def _is_production() -> bool:
    return settings["ENVIRONMENT"] == "production"


def _set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    """access/refresh 토큰을 httpOnly 쿠키로 설정.

    SameSite=Lax 는 동일 호스트(또는 reverse proxy 로 통합된 도메인) 환경에 적합.
    크로스 사이트 OAuth 흐름에서도 callback 은 same-site 응답이라 Lax 로 충분.
    """
    secure = _is_production()
    domain = settings["COOKIE_DOMAIN"] or None

    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access,
        max_age=int(settings["ACCESS_TOKEN_EXPIRE_MINUTES"]) * 60,
        httponly=True,
        secure=secure,
        samesite="lax",
        domain=domain,
        path="/",
    )
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh,
        max_age=int(settings["REFRESH_TOKEN_EXPIRE_DAYS"]) * 86400,
        httponly=True,
        secure=secure,
        samesite="lax",
        domain=domain,
        path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    domain = settings["COOKIE_DOMAIN"] or None
    response.delete_cookie(ACCESS_COOKIE_NAME, domain=domain, path="/")
    response.delete_cookie(REFRESH_COOKIE_NAME, domain=domain, path="/")


@router.get("/kakao/login")
async def kakao_login() -> RedirectResponse:
    """카카오 인가 페이지로 리다이렉트."""
    client_id = settings["KAKAO_CLIENT_ID"]
    redirect_uri = settings["KAKAO_REDIRECT_URI"]
    if not client_id or not redirect_uri:
        raise ExternalAPIException(detail="카카오 OAuth 설정이 누락되었습니다.")

    logger.info(
        f"카카오 로그인 시작 — KAKAO_REDIRECT_URI={redirect_uri}, "
        f"FRONTEND_URL={settings['FRONTEND_URL']}"
    )

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
    }
    return RedirectResponse(
        url=f"{KAKAO_AUTHORIZE_URL}?{urlencode(params)}",
        status_code=status.HTTP_302_FOUND,
    )


async def _exchange_kakao_token(code: str) -> Dict[str, Any]:
    data = {
        "grant_type": "authorization_code",
        "client_id": settings["KAKAO_CLIENT_ID"],
        "redirect_uri": settings["KAKAO_REDIRECT_URI"],
        "code": code,
    }
    if settings["KAKAO_CLIENT_SECRET"]:
        data["client_secret"] = settings["KAKAO_CLIENT_SECRET"]

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            KAKAO_TOKEN_URL,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    if response.status_code != 200:
        logger.error(
            f"카카오 토큰 교환 실패: status={response.status_code}, body={response.text}"
        )
        raise ExternalAPIException(detail="카카오 토큰 교환에 실패했습니다.")
    return response.json()


async def _fetch_kakao_user(access_token: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            KAKAO_USER_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if response.status_code != 200:
        logger.error(
            f"카카오 사용자 정보 조회 실패: status={response.status_code}, body={response.text}"
        )
        raise ExternalAPIException(detail="카카오 사용자 정보 조회에 실패했습니다.")
    return response.json()


@router.get("/kakao/callback")
async def kakao_callback(code: str, db: SessionDep) -> RedirectResponse:
    """카카오 인가 코드를 토큰으로 교환하고 JWT 쿠키를 발급."""
    token_response = await _exchange_kakao_token(code)
    kakao_access = token_response.get("access_token")
    if not kakao_access:
        raise ExternalAPIException(detail="카카오에서 access_token 을 받지 못했습니다.")

    user_info = await _fetch_kakao_user(kakao_access)
    user = await get_or_create_user(db, user_info)

    access = create_access_token({"sub": str(user.ID)})
    refresh = create_refresh_token({"sub": str(user.ID)})

    redirect = RedirectResponse(
        url=settings["FRONTEND_URL"] or "/",
        status_code=status.HTTP_302_FOUND,
    )
    _set_auth_cookies(redirect, access, refresh)
    return redirect


@router.post("/refresh")
async def refresh_token(
    response: Response,
    db: SessionDep,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
) -> Dict[str, str]:
    """refresh 쿠키 → 새 access 쿠키 발급. refresh 자체도 회전(rotation)."""
    if not refresh_token:
        raise UnauthorizedException(detail="refresh 토큰이 없습니다.")

    payload = decode_token(refresh_token, expected_type=REFRESH_TOKEN_TYPE)
    sub = payload.get("sub")
    if sub is None:
        raise UnauthorizedException(detail="유효하지 않은 refresh 토큰입니다.")

    try:
        user_id = int(sub)
    except (TypeError, ValueError):
        raise UnauthorizedException(detail="유효하지 않은 사용자 식별자입니다.")

    from app.crud import get_user_by_id

    user = get_user_by_id(db, user_id)
    if user is None:
        raise UnauthorizedException(detail="존재하지 않는 사용자입니다.")

    access = create_access_token({"sub": str(user.ID)})
    new_refresh = create_refresh_token({"sub": str(user.ID)})
    _set_auth_cookies(response, access, new_refresh)
    return {"status": "ok"}


@router.post("/logout")
async def logout(response: Response) -> Dict[str, str]:
    """쿠키 삭제."""
    _clear_auth_cookies(response)
    return {"status": "ok"}


@router.get("/me")
async def me(user: OptionalUser) -> Dict[str, Any]:
    """현재 로그인한 사용자 정보 반환.

    비로그인 사용자에게도 200 + ``{"user": null}`` 을 돌려준다 (검색 같은 공개 페이지에서
    무거운 401 로그/리다이렉트를 발생시키지 않기 위함).
    """
    if user is None:
        return {"user": None}
    return {
        "user": {
            "id": user.ID,
            "type": user.TYPE,
            "nickname": user.NICKNAME,
            "last_login_at": user.LAST_LOGIN_AT.isoformat() if user.LAST_LOGIN_AT else None,
        }
    }
