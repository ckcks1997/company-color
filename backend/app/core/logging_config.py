import logging
from logging.handlers import RotatingFileHandler
import os
from datetime import datetime


LOG_DIR = "logs"
LOG_LEVEL = logging.INFO
MAX_BYTES = 10_000_000
BACKUP_COUNT = 5

if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

current_date = datetime.now().strftime("%Y-%m-%d")
LOG_FILENAME = f"{LOG_DIR}/app_{current_date}.log"

log_format = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)


def get_file_handler():
    file_handler = RotatingFileHandler(
        LOG_FILENAME,
        maxBytes=MAX_BYTES,
        backupCount=BACKUP_COUNT,
        encoding='utf-8'
    )
    file_handler.setFormatter(log_format)
    return file_handler


def get_console_handler():
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(log_format)
    return console_handler


def get_logger(name: str):
    logger = logging.getLogger(name)
    logger.setLevel(LOG_LEVEL)

    # 기존 핸들러 제거
    if logger.handlers:
        logger.handlers.clear()

    # 핸들러 추가
    logger.addHandler(get_file_handler())
    logger.addHandler(get_console_handler())

    # 상위 로거로 전파 방지
    logger.propagate = False

    return logger


# SQLAlchemy 로거 설정
def setup_sql_logging():
    sql_logger = logging.getLogger('sqlalchemy.engine')
    sql_logger.setLevel(LOG_LEVEL)

    if sql_logger.handlers:
        sql_logger.handlers.clear()

    sql_logger.addHandler(get_file_handler())
    sql_logger.addHandler(get_console_handler())
    sql_logger.propagate = False


# 기본 로거 설정
logger = get_logger(__name__)

# SQL 로깅 설정 적용
setup_sql_logging()