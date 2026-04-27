from datetime import datetime
from typing import Optional

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


class Favorites(SQLModel, table=True):
    __tablename__ = "FAVORITES"
    __table_args__ = (
        UniqueConstraint("user_id", "hash", name="uq_favorites_user_hash"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="USERS.ID", index=True)
    hash: str = Field(index=True)
    company_nm: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
