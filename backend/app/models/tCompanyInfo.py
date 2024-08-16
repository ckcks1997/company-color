from sqlmodel import SQLModel, Field
from typing import Optional

class CompanyInfo(SQLModel, table=True):
    __tablename__ = 'COMPANY_INFO'

    id: Optional[int] = Field(default=None, primary_key=True)
    business_name: str = Field(sa_column_kwargs={"name": "회사명"})
    business_address: str = Field(index=True, sa_column_kwargs={"name": "주소"})
    business_registration_number: str = Field(index=True, sa_column_kwargs={"name": "사업자등록번호"})
    region: str = Field(sa_column_kwargs={"name": "지역"})
    hash: str = Field(sa_column_kwargs={"name": "HASH"})
