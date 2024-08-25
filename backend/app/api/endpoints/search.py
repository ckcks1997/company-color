from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tCompanyInfo import CompanyInfo
from app.models.tGukminYungumData import GukminYungumData
from sqlalchemy import and_, case
from pydantic import BaseModel

router = APIRouter()


class SearchParams(BaseModel):
    business_name: str
    location: str | None = None


@router.get("/search_business", response_model=list[CompanyInfo])
async def search_business(params: SearchParams = Depends(), db: Session = Depends(get_db)):
    conditions = [CompanyInfo.company_nm.ilike(f"%{params.business_name}%")]

    if params.location:
        conditions.append(CompanyInfo.location == params.location)

    query = (db.query(CompanyInfo)
             .filter(and_(*conditions))
             .order_by(
        case(
            (CompanyInfo.company_nm.ilike(f'{params.business_name}%'), 1),
            (CompanyInfo.company_nm.ilike(f'%{params.business_name}'), 2),
            else_=3
        ))
             .limit(30))
    results = query.all()
    return results


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
