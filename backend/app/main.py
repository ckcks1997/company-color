from fastapi import FastAPI, Depends, HTTPException
from database import database, metadata, engine, SessionLocal
import models
import logging
from pydantic import BaseModel
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import and_, case


logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
app = FastAPI()
metadata.create_all(engine)


# Pydantic 모델 (응답 모델)
class GukminYungumDataOut(BaseModel):
    id: int
    business_name: str

    class Config:
        from_attributes = True


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}


@app.get("/search_business")
async def search_business(business_name: str, location: str = None):
    conditions = [models.CompanyInfo.company_nm.ilike(f"%{business_name}%")]

    if location:
        conditions.append(models.CompanyInfo.location == location)

    query = (SessionLocal().query(models.CompanyInfo)
             .filter(and_(*conditions))
             .order_by(
                case(
                    (models.CompanyInfo.company_nm.ilike(f'{business_name}%'), 1),
                    (models.CompanyInfo.company_nm.ilike(f'%{business_name}'), 2),
                    else_=3
                ))
             .limit(30))
    results = query.all()

    if not results:
        raise HTTPException(status_code=404, detail="No matching businesses found")
    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)