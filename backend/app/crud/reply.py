from sqlmodel import Session, select
from fastapi import HTTPException
from app.models import InfoReply, Users
from app.dtos import Reply
from app.core.logging_config import logger


async def save_reply(db: Session, reply: Reply):
    """
    댓글 저장
    
    Args:
        db: 데이터베이스 세션
        reply: 저장할 댓글 정보
        
    Raises:
        HTTPException: 댓글 저장 중 오류가 발생한 경우
    """
    if not reply.hash:
        raise HTTPException(status_code=400, detail="Hash value is required")
        
    if not reply.value:
        raise HTTPException(status_code=400, detail="Reply content is required")
    
    try:
        # 임시 처리 - 토큰 검증 없이 작동하도록 수정
        social_key = "anonymous"  # 익명 사용자로 처리
            
        new_reply = InfoReply(
            hash=reply.hash,
            reply=reply.value,
            users_id=social_key
        )

        db.add(new_reply)
        db.commit()
        logger.info(f"Reply saved: hash={reply.hash}, user={social_key}")
        return
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving reply: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save reply")


async def get_reply_by_hash(db: Session, hash: str):
    """
    특정 해시값에 대한 모든 댓글
    
    Args:
        db: 데이터베이스 세션
        hash: 댓글을 조회할 해시값
        
    Returns:
        댓글 목록
    """
    if not hash:
        raise HTTPException(status_code=400, detail="Hash value is required")
        
    try:
        stmt = select(InfoReply).where(InfoReply.hash == hash).order_by(InfoReply.idx)
        return db.exec(stmt).all()
    except Exception as e:
        logger.error(f"Error retrieving replies: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve replies")
