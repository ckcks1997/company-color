from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tCompanyInfo import CompanyInfo
from app.models.tGukminYungumData import GukminYungumData
from sqlalchemy import and_, case
router = APIRouter()

@router.get("/search_business", response_model=list[CompanyInfo])
async def search_business(business_name: str, location: str = None, db: Session = Depends(get_db)):
    conditions = [CompanyInfo.company_nm.ilike(f"%{business_name}%")]

    if location:
        conditions.append(CompanyInfo.location == location)

    query = (db.query(CompanyInfo)
             .filter(and_(*conditions))
             .order_by(
                case(
                    (CompanyInfo.company_nm.ilike(f'{business_name}%'), 1),
                    (CompanyInfo.company_nm.ilike(f'%{business_name}'), 2),
                    else_=3
                ))
             .limit(30))
    results = query.all()

    if not results:
        raise HTTPException(status_code=404, detail="No matching businesses found")
    return results