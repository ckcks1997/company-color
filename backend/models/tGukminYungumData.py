from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class GukminYungumData(Base):
    __tablename__ = 'GUKMIN_YUNGUM_DATA'
    id = Column(Integer, primary_key=True, autoincrement=True)
    data_creation_date = Column('자료생성년월', Text)
    business_name = Column('사업장명', index=True)
    business_registration_number = Column('사업자등록번호',Text)
    business_status_code = Column('사업장가입상태코드', Integer)
    business_address_jibun = Column('사업장지번상세주소', Text)
    business_address_road = Column('사업장도로명상세주소', Text)
    business_type_code = Column('사업장형태구분코드', Text)
    business_sector_code = Column('사업장업종코드', Text)
    business_sector_name = Column('사업장업종코드명', Text)
    application_date = Column('적용일자', Text)
    reregistration_date = Column('재등록일자', Text)
    withdrawal_date = Column('탈퇴일자', Text)
    number_of_subscribers = Column('가입자수', Text)
    monthly_bill_amount = Column('당월고지금액', Text)
    new_acquisition_count = Column('신규취득자수', Text)
    lost_subscriber_count = Column('상실가입자수', Text)
