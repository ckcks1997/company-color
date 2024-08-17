from sqlmodel import SQLModel, Field
from typing import Optional

class CompanyInfo(SQLModel, table=True):
    __tablename__ = 'COMPANY_INFO'

    id: int
    company_nm: str
    address: str
    business_num: str
    location: str
    hash: str
