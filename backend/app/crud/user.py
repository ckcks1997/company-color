from datetime import datetime
from sqlmodel import Session, select
from fastapi import HTTPException
from app.models import Users
from app.core.logging_config import logger

async def get_or_create_user(db: Session, user_info: dict):
    """
    소셜 로그인 정보를 바탕으로 사용자를 조회하거나 새로 생성
    
    Args:
        db: 데이터베이스 세션
        user_info: 소셜 로그인에서 받아온 사용자 정보
        
    Returns:
        사용자 정보 객체
        
    Raises:
        HTTPException: 사용자 정보가 유효하지 않을 경우
    """
    if not user_info or "id" not in user_info:
        logger.error("Invalid user_info received from social login")
        raise HTTPException(status_code=400, detail="Invalid user information")
        
    social_key = str(user_info["id"])
    stmt = select(Users).where(Users.SOCIAL_KEY == social_key)
    result = db.exec(stmt).first()

    try:
        if result:
            # 기존 사용자 정보 업데이트
            user = result
            user.LAST_LOGIN_AT = datetime.now()
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"User logged in: {social_key}")
            return user
        else:
            # 새 사용자 생성
            nickname = ""
            if user_info.get("properties") and user_info["properties"].get("nickname"):
                nickname = user_info["properties"]["nickname"]
                
            new_user = Users(
                TYPE="kakao",
                SOCIAL_KEY=social_key,
                NICKNAME=nickname,
                LAST_LOGIN_AT=datetime.now()
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            logger.info(f"New user created: {social_key}")
            return new_user
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating/updating user: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")
