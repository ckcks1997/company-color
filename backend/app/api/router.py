from fastapi import APIRouter
from app.api.endpoints import search, reply

router = APIRouter()

# API 라우터 통합
router.include_router(search.router)
router.include_router(reply.router)
