"""
애플리케이션 설정 모듈
"""
import os
from functools import lru_cache
from typing import Dict, Any
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# 환경 변수 키 상수
class EnvVars:
    # 데이터베이스 설정
    DB_HOST = "DB_HOST"
    DB_PORT = "DB_PORT"
    DB_NAME = "DB_NAME"
    DB_USER = "DB_USER"
    DB_PASSWORD = "DB_PASSWORD"
    
    # 환경 설정
    ENVIRONMENT = "ENVIRONMENT"
    ALLOW_ORIGINS = "ALLOW_ORIGINS"
    
    # Elasticsearch 설정
    ELASTIC_HOST = "ELASTIC_HOST"
    ELASTIC_USERNAME = "ELASTIC_USERNAME"
    ELASTIC_PASSWORD = "ELASTIC_PASSWORD"
    
    # DART API 설정
    DART_KEY = "DART_KEY"
    
    # 로깅 설정
    LOG_LEVEL = "LOG_LEVEL"
    SQL_DEBUG = "SQL_DEBUG"
    LOG_DIR = "LOG_DIR"
    LOG_RETENTION_DAYS = "LOG_RETENTION_DAYS"

@lru_cache()
def get_settings() -> Dict[str, Any]:
    """
    애플리케이션 설정을 반환합니다.
    캐싱을 통해 성능을 최적화합니다.
    """
    return {
        # 데이터베이스 설정
        "DB_HOST": os.getenv(EnvVars.DB_HOST, "localhost"),
        "DB_PORT": os.getenv(EnvVars.DB_PORT, "3306"),
        "DB_NAME": os.getenv(EnvVars.DB_NAME, "business_info"),
        "DB_USER": os.getenv(EnvVars.DB_USER, "root"),
        "DB_PASSWORD": os.getenv(EnvVars.DB_PASSWORD, ""),
        
        # 환경 설정
        "ENVIRONMENT": os.getenv(EnvVars.ENVIRONMENT, "development"),
        "ALLOW_ORIGINS": os.getenv(EnvVars.ALLOW_ORIGINS, "http://localhost:3000"),
        
        # Elasticsearch 설정
        "ELASTIC_HOST": os.getenv(EnvVars.ELASTIC_HOST, "http://localhost:9200"),
        "ELASTIC_USERNAME": os.getenv(EnvVars.ELASTIC_USERNAME, "elastic"),
        "ELASTIC_PASSWORD": os.getenv(EnvVars.ELASTIC_PASSWORD, ""),

        # DART API 설정
        "DART_KEY": os.getenv(EnvVars.DART_KEY, ""),
        
        # 로깅 설정
        "LOG_LEVEL": os.getenv(EnvVars.LOG_LEVEL, "INFO"),
        "SQL_DEBUG": os.getenv(EnvVars.SQL_DEBUG, "False").lower() == "true",
        "LOG_DIR": os.getenv(EnvVars.LOG_DIR, "/app/app/logs"),
        "LOG_RETENTION_DAYS": int(os.getenv(EnvVars.LOG_RETENTION_DAYS, "30")),
    }

# 설정 인스턴스 생성
settings = get_settings()

# 설정 값 접근 편의 함수
def get_setting(key: str, default: Any = None) -> Any:
    """특정 설정 값을 반환합니다."""
    return settings.get(key, default)
