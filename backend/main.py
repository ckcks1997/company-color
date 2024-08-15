from fastapi import FastAPI, Depends, HTTPException
from database import database, metadata, engine, SessionLocal
import models
from pydantic import BaseModel
from models.tGukminYungumData import GukminYungumData
from sqlalchemy.orm import sessionmaker, Session
from typing import List
app = FastAPI()
metadata.create_all(engine)


# Pydantic 모델 (응답 모델)
class GukminYungumDataOut(BaseModel):
    id: int
    business_name: str

    class Config:
        orm_mode = True


# 데이터베이스 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}

@app.get("/search_business", response_model=None)
async def search_business(business_name: str, db: Session = Depends(get_db)):
    print(1)
    query = (db.query(GukminYungumData)
             .filter(GukminYungumData.business_name.like(f"%{business_name}%"))
             .limit(5))
    results = query.all()
    if not results:
        raise HTTPException(status_code=404, detail="No matching businesses found")
    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)