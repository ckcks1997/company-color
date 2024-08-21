from sqlmodel import SQLModel, Field
from typing import Optional

class GukminYungumData(SQLModel, table=True):
    __tablename__ = 'GUKMIN_YUNGUM_DATA'

    id: Optional[int] = Field(default=None, primary_key=True)
    created_dt: str
    company_nm: str
    business_num: str
    business_reg_status: int
    business_location: str
    business_location_specific: str
    business_type_code: int
    business_code: str
    industry_code: str
    applied_date: str
    withdrawal_date: str
    subscriber_cnt: int
    monthly_payment_amt: str
    subscriber_new: int
    subscriber_quit: int
    hash: str