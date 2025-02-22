from sqlmodel import SQLModel, Field
from typing import Optional

class Corpcode(SQLModel, table=True):
    __tablename__ = 'CORPCODE'

    corp_code: str = Field(default=None, primary_key=True)
    corp_name: str
    corp_eng_name: str
    stock_code: str
    modify_date: str
