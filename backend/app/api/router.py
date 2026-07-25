from fastapi import APIRouter

from app.api.endpoints import auth, me, reply, search

router = APIRouter()

# API 라우터 통합
router.include_router(search.router)
router.include_router(reply.router)
router.include_router(auth.router)
router.include_router(me.router)
