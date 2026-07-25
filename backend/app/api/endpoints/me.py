"""마이페이지 엔드포인트 — 즐겨찾기와 본인 댓글 조회.

모든 라우트는 ``CurrentUser`` 의존성으로 인증을 강제한다.
"""
from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.api.deps import CurrentUser, SessionDep
from app.crud import (
    add_favorite,
    get_replies_by_user,
    list_favorite_hashes,
    list_favorites,
    remove_favorite,
)
from app.dtos import PaginatedResponse

router = APIRouter(prefix="/api/v1/me", tags=["me"])


class FavoriteCreate(BaseModel):
    hash: str = Field(..., min_length=1, description="회사 해시값")
    company_nm: str | None = Field(None, description="저장 시점의 회사명 스냅샷")


class FavoriteItem(BaseModel):
    hash: str
    company_nm: str | None
    created_at: str


@router.get("/favorites/hashes", response_model=List[str])
async def list_my_favorite_hashes(
    user: CurrentUser, db: SessionDep
) -> List[str]:
    """본인 즐겨찾기의 hash 만 배열로 반환.

    검색 결과 카드/상세 페이지에서 별 아이콘 채움 여부를 판단할 때 사용한다.
    페이지네이션 없이 전부 반환
    """
    return list_favorite_hashes(db, user.ID)


@router.get("/favorites", response_model=PaginatedResponse[FavoriteItem])
async def list_my_favorites(
    user: CurrentUser,
    db: SessionDep,
    page: int = 1,
    items_per_page: int = 30,
) -> PaginatedResponse[FavoriteItem]:
    """본인 즐겨찾기 목록."""
    total_count, items = list_favorites(db, user.ID, page=page, items_per_page=items_per_page)
    total_pages = (
        (total_count + items_per_page - 1) // items_per_page if total_count > 0 else 0
    )
    return PaginatedResponse[FavoriteItem](
        items=[
            FavoriteItem(
                hash=f.hash,
                company_nm=f.company_nm,
                created_at=f.created_at.isoformat(),
            )
            for f in items
        ],
        total_count=total_count,
        page=page,
        items_per_page=items_per_page,
        total_pages=total_pages,
    )


@router.post("/favorites", response_model=FavoriteItem)
async def add_my_favorite(
    body: FavoriteCreate, user: CurrentUser, db: SessionDep
) -> FavoriteItem:
    """즐겨찾기 등록."""
    favorite = add_favorite(db, user.ID, body.hash, body.company_nm)
    return FavoriteItem(
        hash=favorite.hash,
        company_nm=favorite.company_nm,
        created_at=favorite.created_at.isoformat(),
    )


@router.delete("/favorites/{hash}")
async def remove_my_favorite(
    hash: str, user: CurrentUser, db: SessionDep
) -> Dict[str, str]:
    """즐겨찾기 해제."""
    remove_favorite(db, user.ID, hash)
    return {"status": "ok"}


@router.get("/replies")
async def list_my_replies(
    user: CurrentUser, db: SessionDep
) -> List[Dict[str, Any]]:
    """본인이 작성한 댓글 전체 목록 (간단 출력)."""
    replies = await get_replies_by_user(db, user.ID)
    return [
        {
            "idx": r.idx,
            "hash": r.hash,
            "reply": r.reply,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in replies
    ]
