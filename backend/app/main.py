from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
from app.core.exceptions import (
    CustomHTTPException,
    http_exception_handler,
    generic_exception_handler
)
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router as api_router
from app.core.config import settings
from app.core.logging_config import logger, setup_sql_logging
from app.core.database import connect_database, disconnect_database
from dotenv import load_dotenv
import uvicorn

# 환경 변수 로드
load_dotenv()

# 환경 변수로 운영 환경 여부 확인
IS_PRODUCTION = settings["ENVIRONMENT"] == "production"

# 운영환경에서 swagger 비활성화
docs_url = None if IS_PRODUCTION else "/docs"
redoc_url = None if IS_PRODUCTION else "/redoc"

# SQL 로깅 설정
setup_sql_logging()

# Lifespan 이벤트 핸들러
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 애플리케이션 시작 시
    logger.info("애플리케이션 시작")
    await connect_database()
    yield
    # 애플리케이션 종료 시
    logger.info("애플리케이션 종료")
    await disconnect_database()

# FastAPI 애플리케이션 생성
app = FastAPI(
    title="비즈니스 정보 API",
    description="국민연금 가입 회사 정보 및 댓글 서비스를 제공하는 API",
    version="1.0.0",
    docs_url=docs_url, 
    redoc_url=redoc_url,
    lifespan=lifespan
)

# 미들웨어: 요청 처리 시간 측정
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# 예외 핸들러 등록
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(CustomHTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings["ALLOW_ORIGINS"].split(',')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(api_router)

# 상태 확인 엔드포인트
@app.get("/health")
async def health_check():
    """서버 상태 확인 엔드포인트"""
    return {"status": "ok", "environment": settings["ENVIRONMENT"]}

# 애플리케이션 직접 실행 시
if __name__ == "__main__":
    # 프로덕션 환경에서는 reload=False 사용
    is_development = settings["ENVIRONMENT"] == "development"
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=8001, 
        reload=is_development,
        access_log=is_development
    )
