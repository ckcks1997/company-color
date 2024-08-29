from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tCompanyInfo import CompanyInfo
from app.models.tGukminYungumData import GukminYungumData
from sqlalchemy import and_, case, func
from pydantic import BaseModel

router = APIRouter()


class SearchParams(BaseModel):
    business_name: str
    location: str | None = None
    page: int = 1
    items_per_page: int = 30


class PaginatedResponse(BaseModel):
    items: list[CompanyInfo]
    total_count: int
    page: int
    items_per_page: int
    total_pages: int


@router.get("/search_business", response_model=PaginatedResponse)
async def search_business(params: SearchParams = Depends(), db: Session = Depends(get_db)):
    conditions = [CompanyInfo.company_nm.ilike(f"%{params.business_name}%")]

    if params.location:
        conditions.append(CompanyInfo.location == params.location)

    # total cnt
    count_query = db.query(func.count(CompanyInfo.id)).filter(and_(*conditions))
    total_count = count_query.scalar()

    # search query
    query = (db.query(CompanyInfo)
             .filter(and_(*conditions))
             .order_by(
        case(
            (CompanyInfo.company_nm.ilike(f'{params.business_name}%'), 1),
            (CompanyInfo.company_nm.ilike(f'%{params.business_name}'), 2),
            else_=3
        ))
             .offset((params.page - 1) * params.items_per_page)
             .limit(params.items_per_page))

    results = query.all()

    total_pages = (total_count + params.items_per_page - 1) // params.items_per_page

    return PaginatedResponse(
        items=results,
        total_count=total_count,
        page=params.page,
        items_per_page=params.items_per_page,
        total_pages=total_pages
    )


@router.get("/get_business_info", response_model=list[GukminYungumData])
async def get_business_info(hash: str, db: Session = Depends(get_db)):
    results = None
    if hash:
        query = (db.query(GukminYungumData)
                 .filter(
            and_(
                GukminYungumData.hash == hash,
                GukminYungumData.created_dt >= '2023-08'
            )
        )
                 .order_by(GukminYungumData.created_dt))
        results = query.all()

    return results
