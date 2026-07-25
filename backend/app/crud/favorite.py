from typing import List, Optional, Tuple

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, func, select

from app.core.exceptions import BusinessException, NotFoundException
from app.core.logging_config import logger
from app.models import Favorites


def list_favorites(
    db: Session, user_id: int, page: int = 1, items_per_page: int = 30
) -> Tuple[int, List[Favorites]]:
    """본인 즐겨찾기 목록 페이지네이션."""
    base = select(Favorites).where(Favorites.user_id == user_id)
    total_count = db.exec(
        select(func.count()).select_from(base.subquery())
    ).one()
    items = db.exec(
        base.order_by(Favorites.created_at.desc())
        .offset((page - 1) * items_per_page)
        .limit(items_per_page)
    ).all()
    return int(total_count), list(items)


def add_favorite(
    db: Session, user_id: int, hash: str, company_nm: Optional[str] = None
) -> Favorites:
    """즐겨찾기 등록 — 이미 존재하면 BusinessException."""
    favorite = Favorites(user_id=user_id, hash=hash, company_nm=company_nm)
    db.add(favorite)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        logger.info(f"이미 즐겨찾기에 존재: user_id={user_id}, hash={hash}")
        raise BusinessException(detail="이미 즐겨찾기에 추가된 회사입니다.")
    db.refresh(favorite)
    logger.info(f"Favorite added: user_id={user_id}, hash={hash}")
    return favorite


def remove_favorite(db: Session, user_id: int, hash: str) -> None:
    """즐겨찾기 해제 — 없으면 NotFoundException."""
    favorite = db.exec(
        select(Favorites).where(
            (Favorites.user_id == user_id) & (Favorites.hash == hash)
        )
    ).first()
    if favorite is None:
        raise NotFoundException(detail="즐겨찾기에 없는 회사입니다.")

    db.delete(favorite)
    db.commit()
    logger.info(f"Favorite removed: user_id={user_id}, hash={hash}")


def is_favorite(db: Session, user_id: int, hash: str) -> bool:
    """현재 즐겨찾기 등록 여부."""
    found = db.exec(
        select(Favorites.id).where(
            (Favorites.user_id == user_id) & (Favorites.hash == hash)
        )
    ).first()
    return found is not None


def list_favorite_hashes(db: Session, user_id: int) -> List[str]:
    """본인 즐겨찾기의 hash 만 반환 — 클라이언트 측 lookup 용 가벼운 응답."""
    return list(
        db.exec(
            select(Favorites.hash).where(Favorites.user_id == user_id)
        ).all()
    )
