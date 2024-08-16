from sqlmodel import SQLModel, Field
from typing import Optional

class GukminYungumData(SQLModel, table=True):
    __tablename__ = 'GUKMIN_YUNGUM_DATA'

    id: Optional[int] = Field(default=None, primary_key=True)
    data_creation_date: str = Field(sa_column_kwargs={"name": "자료생성년월"})
    business_name: str = Field(index=True, sa_column_kwargs={"name": "사업장명"})
    business_registration_number: str = Field(sa_column_kwargs={"name": "사업자등록번호"})
    business_status_code: int = Field(sa_column_kwargs={"name": "사업장가입상태코드"})
    business_address_jibun: str = Field(sa_column_kwargs={"name": "사업장지번상세주소"})
    business_address_road: str = Field(sa_column_kwargs={"name": "사업장도로명상세주소"})
    business_type_code: str = Field(sa_column_kwargs={"name": "사업장형태구분코드"})
    business_sector_code: str = Field(sa_column_kwargs={"name": "사업장업종코드"})
    business_sector_name: str = Field(sa_column_kwargs={"name": "사업장업종코드명"})
    application_date: str = Field(sa_column_kwargs={"name": "적용일자"})
    reregistration_date: str = Field(sa_column_kwargs={"name": "재등록일자"})
    withdrawal_date: str = Field(sa_column_kwargs={"name": "탈퇴일자"})
    number_of_subscribers: str = Field(sa_column_kwargs={"name": "가입자수"})
    monthly_bill_amount: str = Field(sa_column_kwargs={"name": "당월고지금액"})
    new_acquisition_count: str = Field(sa_column_kwargs={"name": "신규취득자수"})
    lost_subscriber_count: str = Field(sa_column_kwargs={"name": "상실가입자수"})
    hash: str = Field(sa_column_kwargs={"name": "HASH"})