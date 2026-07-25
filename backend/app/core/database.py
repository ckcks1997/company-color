from sqlmodel import Session, create_engine, text, QueuePool
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings
from app.core.logging_config import logger
from typing import Generator


DATABASE_URL = f"mysql+pymysql://{settings['DB_USER']}:{settings['DB_PASSWORD']}@{settings['DB_HOST']}:{settings['DB_PORT']}/{settings['DB_NAME']}"

# SQLModel 엔진 (Connection Pool 사용)
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings['SQL_DEBUG']
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


# 테스트
if __name__ == "__main__":
    with Session(engine) as session:
        try:
            result = session.exec(text("SELECT 1")).first()
            print(f"Database connection successful: {result == 1}")
        except Exception as e:
            print(f"Database connection failed: {str(e)}")
