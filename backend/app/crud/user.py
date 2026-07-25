from datetime import datetime
from typing import Any, Dict, Optional

from sqlmodel import Session, select

from app.core.exceptions import BusinessException
from app.core.logging_config import logger
from app.models import Users


async def get_or_create_user(db: Session, user_info: Dict[str, Any]) -> Users:
    """소셜 로그인 정보로 사용자를 조회하거나 새로 생성.

    Args:
        db: DB 세션.
        user_info: 카카오 사용자 정보 (``{"id": ..., "properties": {"nickname": ...}}``).

    Returns:
        영속화된 Users 인스턴스 (``ID`` 가 채워진 상태).
    """
    if not user_info or "id" not in user_info:
        logger.error("Invalid user_info received from social login")
        raise BusinessException(detail="Invalid user information")

    social_key = str(user_info["id"])
    stmt = select(Users).where(Users.SOCIAL_KEY == social_key)
    user = db.exec(stmt).first()

    try:
        if user:
            user.LAST_LOGIN_AT = datetime.now()
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"User logged in: {social_key}")
            return user

        nickname = ""
        properties = user_info.get("properties") or {}
        if isinstance(properties, dict) and properties.get("nickname"):
            nickname = properties["nickname"]

        new_user = Users(
            TYPE="kakao",
            SOCIAL_KEY=social_key,
            NICKNAME=nickname,
            LAST_LOGIN_AT=datetime.now(),
            CREATED_AT=datetime.now(),
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info(f"New user created: {social_key}")
        return new_user
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating/updating user: {e}")
        raise


def get_user_by_id(db: Session, user_id: int) -> Optional[Users]:
    """USERS.ID 로 사용자 조회 (없으면 None)."""
    return db.exec(select(Users).where(Users.ID == user_id)).first()
