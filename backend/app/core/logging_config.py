import logging
import sys
from datetime import datetime
from pathlib import Path
import os
from logging.handlers import TimedRotatingFileHandler

# 로그 디렉터리 생성
#C:/Users/Owner/PycharmProjects/company-color/backend
log_dir = Path("/app/app/logs")
log_dir.mkdir(exist_ok=True)

# 현재 날짜로 로그 파일명 생성
current_date = datetime.now().strftime("%Y-%m-%d")
log_file = log_dir / f"app_{current_date}.log"

# 로거 설정
logger = logging.getLogger("app")
logger.setLevel(logging.INFO)

# 로그 포맷 설정
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s"
)

# 콘솔 핸들러
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.INFO)

# 파일 핸들러 (일별 로그 파일 생성)
file_handler = TimedRotatingFileHandler(
    filename=log_file,
    when="midnight",
    interval=1,
    backupCount=30,  # 30일치 로그 유지
    encoding="utf-8",
)
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.INFO)

# 핸들러 추가
logger.addHandler(console_handler)
logger.addHandler(file_handler)

# SQLAlchemy 로깅 설정
def setup_sql_logging():
    """SQLAlchemy 로깅 설정"""
    from app.core.config import settings
    
    if settings["SQL_DEBUG"]:
        logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
        logging.getLogger("sqlalchemy.pool").setLevel(logging.INFO)
    else:
        # 오류만 로깅
        logging.getLogger("sqlalchemy.engine").setLevel(logging.ERROR)
        logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)

# HTTPX 로깅 설정
httpx_logger = logging.getLogger("httpx")
httpx_logger.setLevel(logging.WARNING)
httpx_logger.addHandler(console_handler)
httpx_logger.addHandler(file_handler)

# Elasticsearch 로깅 설정 
elasticsearch_logger = logging.getLogger("elasticsearch")
elasticsearch_logger.setLevel(logging.WARNING)
elasticsearch_logger.addHandler(console_handler)
elasticsearch_logger.addHandler(file_handler)

# 기본 핸들러 제거 (중복 로깅 방지)
logging.getLogger().handlers = []

# 시작 로그 출력
logger.info("=== Application starting ===")
