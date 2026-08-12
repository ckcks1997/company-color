from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional

from app.dtos import SitemapCompaniesResponse, SitemapCompanyItem, SitemapSummary
from app.api.deps import SessionDep
import app.crud as crud
from app.core.constants import SITEMAP_MAX_PAGE_SIZE, SITEMAP_DEFAULT_PAGE_SIZE
from app.core.logging_config import logger

router = APIRouter(prefix="/api/v1/sitemap", tags=["sitemap"])


@router.get("/summary", response_model=SitemapSummary, summary="sitemap 메타 정보")
async def sitemap_summary(db: SessionDep):
    """
    sitemap 분할에 필요한 전체 회사 수와 id 범위를 반환한다.

    프론트엔드가 이 값으로 sitemap 샤드 개수를 계산한다.
    """
    try:
        min_id, max_id, total_count = await crud.get_company_id_bounds(db)
        return SitemapSummary(total_count=total_count, min_id=min_id, max_id=max_id)
    except Exception as e:
        logger.error(f"sitemap 요약 조회 중 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="sitemap 정보를 불러오지 못했습니다."
        )


@router.get("/companies", response_model=SitemapCompaniesResponse, summary="sitemap 용 회사 해시 목록")
async def sitemap_companies(
    db: SessionDep,
    after_id: int = Query(0, ge=0, description="이 id 보다 큰 항목부터 조회 (커서)"),
    max_id: Optional[int] = Query(None, ge=0, description="이 id 이하까지만 조회 (샤드 상한)"),
    limit: int = Query(
        SITEMAP_DEFAULT_PAGE_SIZE, ge=1, le=SITEMAP_MAX_PAGE_SIZE, description="페이지당 항목 수"
    ),
):
    """
    sitemap 생성용 회사 해시 목록을 PK 커서 방식으로 조회한다.

    - **after_id**: 직전 응답의 `next_cursor` 를 그대로 전달
    - **max_id**: 샤드 상한. 지정 시 해당 id 이하만 반환
    - **limit**: 페이지당 항목 수

    Returns:
        회사 id/hash 목록과 다음 커서. 더 이상 결과가 없으면 `next_cursor` 는 null
    """
    try:
        rows = await crud.list_company_hashes(
            db, after_id=after_id, limit=limit, max_id=max_id
        )
        items = [SitemapCompanyItem(id=row.id, hash=row.hash) for row in rows]
        # limit 만큼 꽉 찼을 때만 다음 페이지가 남아있을 수 있다.
        next_cursor = items[-1].id if len(items) == limit else None
        return SitemapCompaniesResponse(items=items, next_cursor=next_cursor)
    except Exception as e:
        logger.error(f"sitemap 회사 목록 조회 중 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="sitemap 정보를 불러오지 못했습니다."
        )
