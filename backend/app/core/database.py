from contextlib import contextmanager
from databases import Database
from sqlmodel import Session, create_engine, text, QueuePool
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings
from app.core.logging_config import logger
from typing import Generator, Optional


DATABASE_URL = f"mysql+pymysql://{settings['DB_USER']}:{settings['DB_PASSWORD']}@{settings['DB_HOST']}:{settings['DB_PORT']}/{settings['DB_NAME']}"

# 비동기 Database 객체
database = Database(DATABASE_URL)

# SQLModel 엔진 (Connection Pool 사용)
engine = create_engine(
    DATABASE_URL, 
    poolclass=QueuePool, 
    pool_size=5,  # 기본 연결 풀 크기
    max_overflow=10,  # 최대 추가 연결 수
    pool_timeout=30,  # 연결 타임아웃(초)
    pool_pre_ping=True,  # 연결 유효성 검사
    pool_recycle=3600,  # 연결 재활용 시간(초)
    echo=settings['SQL_DEBUG']  # SQL 쿼리 로깅
)


def get_db() -> Generator[Session, None, None]:
    """
    데이터베이스 세션을 제공하는 의존성 함수
    
    Yields:
        Session: SQLModel 세션 객체
    """
    db = Session(engine)
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

# 비동기 Database 객체 관리 함수
async def connect_database():
    """비동기 데이터베이스 연결"""
    if not database.is_connected:
        try:
            await database.connect()
            logger.info("Async database connected")
        except Exception as e:
            logger.error(f"Failed to connect to async database: {str(e)}")
            raise


async def disconnect_database():
    """비동기 데이터베이스 연결 해제"""
    if database.is_connected:
        try:
            await database.disconnect()
            logger.info("Async database disconnected")
        except Exception as e:
            logger.error(f"Error disconnecting from async database: {str(e)}")


# 테스트
if __name__ == "__main__":
    # 데이터베이스 연결 테스트
    with Session(engine) as session:
        try:
            result = session.exec(text("SELECT 1")).first()
            print(f"Database connection successful: {result == 1}")
        except Exception as e:
            print(f"Database connection failed: {str(e)}")
