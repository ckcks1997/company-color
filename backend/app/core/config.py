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

    # JWT 설정
    SECRET_KEY = "SECRET_KEY"
    JWT_ALGORITHM = "JWT_ALGORITHM"
    ACCESS_TOKEN_EXPIRE_MINUTES = "ACCESS_TOKEN_EXPIRE_MINUTES"
    REFRESH_TOKEN_EXPIRE_DAYS = "REFRESH_TOKEN_EXPIRE_DAYS"

    # 카카오 OAuth 설정
    KAKAO_CLIENT_ID = "KAKAO_CLIENT_ID"
    KAKAO_CLIENT_SECRET = "KAKAO_CLIENT_SECRET"
    KAKAO_REDIRECT_URI = "KAKAO_REDIRECT_URI"

    # 프론트엔드 URL (OAuth 콜백 후 리다이렉트, 쿠키 SameSite 결정 등)
    FRONTEND_URL = "FRONTEND_URL"
    COOKIE_DOMAIN = "COOKIE_DOMAIN"

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
        # 로컬 개발 시 localhost / 127.0.0.1 양쪽을 모두 허용해 어떤 조합에서도 동작.
        "ALLOW_ORIGINS": os.getenv(
            EnvVars.ALLOW_ORIGINS,
            "http://localhost:4000,http://127.0.0.1:4000",
        ),
        
        # Elasticsearch 설정
        "ELASTIC_HOST": os.getenv(EnvVars.ELASTIC_HOST, "http://localhost:9200"),
        "ELASTIC_USERNAME": os.getenv(EnvVars.ELASTIC_USERNAME, "elastic"),
        "ELASTIC_PASSWORD": os.getenv(EnvVars.ELASTIC_PASSWORD, ""),

        # DART API 설정
        "DART_KEY": os.getenv(EnvVars.DART_KEY, ""),
        
        # 로깅 설정
        "LOG_LEVEL": os.getenv(EnvVars.LOG_LEVEL, "INFO"),
        "SQL_DEBUG": os.getenv(EnvVars.SQL_DEBUG, "False").lower() == "true",
        "LOG_DIR": os.getenv(EnvVars.LOG_DIR, "app/logs"),
        "LOG_RETENTION_DAYS": int(os.getenv(EnvVars.LOG_RETENTION_DAYS, "30")),

        # JWT 설정
        "SECRET_KEY": os.getenv(EnvVars.SECRET_KEY, ""),
        "JWT_ALGORITHM": os.getenv(EnvVars.JWT_ALGORITHM, "HS256"),
        "ACCESS_TOKEN_EXPIRE_MINUTES": int(os.getenv(EnvVars.ACCESS_TOKEN_EXPIRE_MINUTES, "60")),
        "REFRESH_TOKEN_EXPIRE_DAYS": int(os.getenv(EnvVars.REFRESH_TOKEN_EXPIRE_DAYS, "14")),

        # 카카오 OAuth 설정
        "KAKAO_CLIENT_ID": os.getenv(EnvVars.KAKAO_CLIENT_ID, ""),
        "KAKAO_CLIENT_SECRET": os.getenv(EnvVars.KAKAO_CLIENT_SECRET, ""),
        "KAKAO_REDIRECT_URI": os.getenv(EnvVars.KAKAO_REDIRECT_URI, "http://localhost:8001/api/v1/auth/kakao/callback"),

        # 프론트엔드 URL — OAuth 콜백 완료 후 리다이렉트 대상.
        # 빈 문자열 또는 미설정 시 COOKIE_DOMAIN 분기에서 same-site 쿠키만 사용.
        "FRONTEND_URL": os.getenv(EnvVars.FRONTEND_URL, "http://localhost:4000"),
        # 쿠키 도메인 — 백/프 도메인이 같으면 비워 둠 (자동으로 host 기준 same-site 쿠키).
        # 다른 서브도메인을 공유하려면 ".companycolor.xyz" 처럼 설정.
        "COOKIE_DOMAIN": os.getenv(EnvVars.COOKIE_DOMAIN, ""),
    }

# 설정 인스턴스 생성
settings = get_settings()

# 설정 값 접근 편의 함수
def get_setting(key: str, default: Any = None) -> Any:
    """특정 설정 값을 반환합니다."""
    return settings.get(key, default)
