from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional

class Users(SQLModel, table=True):
    __tablename__ = 'USERS'

    ID: Optional[int] = Field(default=None, primary_key=True)
    TYPE: str
    SOCIAL_KEY: str
    NICKNAME: str
    LAST_LOGIN_AT: datetime
    CREATED_AT: datetime
