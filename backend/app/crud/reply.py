from typing import List

from sqlmodel import Session, select

from app.core.logging_config import logger
from app.dtos import Reply
from app.models import InfoReply, Users


async def save_reply(db: Session, reply: Reply, user: Users) -> InfoReply:
    """댓글 저장.

    Args:
        db: DB 세션.
        reply: 검증된 DTO (hash, value).
        user: 인증된 사용자 — ``users_id`` 컬럼에 USERS.ID 를 문자열로 저장한다.
    """
    try:
        new_reply = InfoReply(
            hash=reply.hash,
            reply=reply.value,
            users_id=str(user.ID),
        )
        db.add(new_reply)
        db.commit()
        db.refresh(new_reply)
        logger.info(f"Reply saved: hash={reply.hash}, user_id={user.ID}")
        return new_reply
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving reply: {e}")
        raise


async def get_reply_by_hash(db: Session, hash: str) -> List[InfoReply]:
    """특정 해시값에 대한 모든 댓글."""
    stmt = select(InfoReply).where(InfoReply.hash == hash).order_by(InfoReply.idx)
    return db.exec(stmt).all()


async def get_replies_by_user(db: Session, user_id: int) -> List[InfoReply]:
    """본인이 작성한 댓글 목록 (마이페이지용)."""
    stmt = (
        select(InfoReply)
        .where(InfoReply.users_id == str(user_id))
        .order_by(InfoReply.idx.desc())
    )
    return db.exec(stmt).all()
