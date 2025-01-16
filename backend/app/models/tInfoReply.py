from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional

class InfoReply(SQLModel, table=True):
    __tablename__ = 'INFO_REPLY'

    idx: Optional[int] = Field(default=None, primary_key=True)
    hash: str
    reply: str
    users_id: str
    use_yn: Optional[str] = Field(default="Y")
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
