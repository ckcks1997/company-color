from databases import Database
from sqlmodel import Session, create_engine, text, QueuePool
from app.core.config import db_settings


DATABASE_URL = f"mysql+pymysql://{db_settings.DB_USER}:{db_settings.DB_PASSWORD}@{db_settings.DB_HOST}:{db_settings.DB_PORT}/{db_settings.DB_NAME}"
database = Database(DATABASE_URL)
engine = create_engine(DATABASE_URL, poolclass=QueuePool, pool_size=5, max_overflow=10, pool_timeout=30, pool_pre_ping=True)

def get_db() -> Session:
    with Session(engine) as session:
        yield session


# test
if __name__ == "__main__":
    # 데이터베이스 연결 테스트
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print(f"Database connection successful: {result.fetchone()[0] == 1}")
