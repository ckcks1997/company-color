from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional

class InfoReply(SQLModel, table=True):
    __tablename__ = 'INFO_REPLY'

    IDX: Optional[int] = Field(default=None, primary_key=True)
    HASH: str
    REPLY: str
    USERS_ID: str
    USE_YN: Optional[str] = Field(default="Y")
    CREATED_AT: Optional[datetime] = Field(default_factory=datetime.now)
