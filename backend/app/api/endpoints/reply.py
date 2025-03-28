from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.api.deps import SessionDep
from app.crud import save_reply, get_reply_by_hash
from app.dtos import Reply
from app.models.tInfoReply import InfoReply
from app.core.logging_config import logger
from app.core.exceptions import BusinessException, NotFoundException

router = APIRouter(prefix="/api/v1",tags=["reply"])

@router.post("/reply", summary="댓글 등록")
async def post_reply(reply: Reply, db: SessionDep):
    """
    댓글 등록

    Returns:
        등록된 댓글 정보
    """
    if not reply.access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="인증이 필요합니다",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    if not reply.hash:
        raise BusinessException(detail="회사 해시값이 필요합니다")
        
    if not reply.value or not reply.value.strip():
        raise BusinessException(detail="댓글 내용을 입력해주세요")
        
    try:
        await save_reply(db, reply)
        logger.info(f"댓글 등록 성공: hash={reply.hash}")
        return {"status": "success", "message": "댓글이 등록되었습니다"}
    except Exception as e:
        logger.error(f"댓글 등록 실패: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="댓글 등록 중 오류가 발생했습니다"
        )


@router.get("/reply", response_model=List[InfoReply], summary="댓글 조회")
async def get_reply(db: SessionDep, hash: str):
    """
    댓글 목록 조회
    
    - **hash**: 회사 해시값 (필수)
    
    Returns:
        댓글 목록
    """
    if not hash:
        raise BusinessException(detail="회사 해시값이 필요합니다")
        
    try:
        replies = await get_reply_by_hash(db, hash)
        
        if not replies and hash:
            logger.info(f"댓글 없음: hash={hash}")
            
        return replies
    except Exception as e:
        logger.error(f"댓글 조회 실패: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="댓글 조회 중 오류가 발생했습니다.."
        )
