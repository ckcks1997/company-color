from datetime import datetime
from sqlmodel import Session, select
from app.models import GukminYungumData, CompanyInfo
from sqlalchemy import and_, case, func
from app.models.tUsers import Users


def get_business_info(db: Session, hash: str):
    query = (select(GukminYungumData)
             .filter(
        and_(
            GukminYungumData.hash == hash,
            GukminYungumData.created_dt >= '2023-08'
        )
    )
             .order_by(GukminYungumData.created_dt))
    return db.exec(query).all()


def search_companies(db: Session, params):
    conditions = [CompanyInfo.company_nm.ilike(f"%{params.business_name}%")]

    if params.location:
        conditions.append(CompanyInfo.location == params.location)

    # total cnt
    count_query = select(func.count(CompanyInfo.id)).where(and_(*conditions))
    total_count = db.exec(count_query).first()

    # 실제 검색 쿼리
    query = (select(CompanyInfo)
             .where(and_(*conditions))
             .order_by(
        case(
            (CompanyInfo.company_nm.ilike(f'{params.business_name}%'), 1),
            (CompanyInfo.company_nm.ilike(f'%{params.business_name}'), 2),
            else_=3
        ))
             .offset((params.page - 1) * params.items_per_page)
             .limit(params.items_per_page))

    results = db.exec(query).all()

    return total_count, results


async def get_or_create_user(db: Session, user_info: dict):
    social_key = str(user_info["id"])
    stmt = select(Users).where(Users.SOCIAL_KEY == social_key)
    result = db.exec(stmt).first()

    if result:
        user = result
        user.LAST_LOGIN_AT = datetime.now()
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    else:
        # 새 사용자 생성
        new_user = Users(
            TYPE="kakao",
            SOCIAL_KEY=social_key,
            NICKNAME='',
            LAST_LOGIN_AT=datetime.now()
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user