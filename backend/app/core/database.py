from sqlalchemy import create_engine, MetaData, text
from databases import Database
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv, find_dotenv
from sqlalchemy.pool import QueuePool

# .env 환경변수 load
import os
load_dotenv(dotenv_path=".env")

# 데이터베이스 연결 정보
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
database = Database(DATABASE_URL)
engine = create_engine(DATABASE_URL, poolclass=QueuePool, pool_size=5, max_overflow=10, pool_timeout=30, pool_pre_ping=True)
metadata = MetaData()
Base = declarative_base()

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# test
if __name__ == "__main__":
    # 데이터베이스 연결 테스트
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print(f"Database connection successful: {result.fetchone()[0] == 1}")
