from typing import List

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, SessionDep
from app.core.exceptions import BusinessException
from app.core.logging_config import logger
from app.crud import get_reply_by_hash, save_reply
from app.dtos import Reply
from app.models.tInfoReply import InfoReply

router = APIRouter(prefix="/api/v1", tags=["reply"])


@router.post("/reply", summary="댓글 등록 (로그인 필요)")
async def post_reply(reply: Reply, db: SessionDep, user: CurrentUser) -> dict:
    """댓글 등록. 로그인 사용자만 호출 가능."""
    try:
        await save_reply(db, reply, user)
        return {"status": "success", "message": "댓글이 등록되었습니다"}
    except Exception as e:
        logger.error(f"댓글 등록 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="댓글 등록 중 오류가 발생했습니다",
        )


@router.get("/reply", response_model=List[InfoReply], summary="댓글 조회")
async def get_reply(db: SessionDep, hash: str) -> List[InfoReply]:
    """댓글 목록 조회 — 비로그인 사용자도 가능."""
    if not hash:
        raise BusinessException(detail="회사 해시값이 필요합니다")

    try:
        replies = await get_reply_by_hash(db, hash)
        if not replies:
            logger.info(f"댓글 없음: hash={hash}")
        return replies
    except Exception as e:
        logger.error(f"댓글 조회 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="댓글 조회 중 오류가 발생했습니다.",
        )
