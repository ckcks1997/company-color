from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import search, oauth, reply
from app.core.config import db_settings
from app.core.logging_config import setup_sql_logging

# 환경 변수로 운영 환경 여부 확인
IS_PRODUCTION = db_settings.ENVIRONMENT == "production"

# 운영환경에서 swagger 비활성화
docs_url = None if IS_PRODUCTION else "/docs"
redoc_url = None if IS_PRODUCTION else "/redoc"

setup_sql_logging()

app = FastAPI(docs_url=docs_url, redoc_url=redoc_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in db_settings.ALLOW_ORIGINS.split(',')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)
app.include_router(oauth.router)
app.include_router(reply.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
