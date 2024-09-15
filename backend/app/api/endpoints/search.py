from fastapi import APIRouter, Depends
from app.models.tGukminYungumData import GukminYungumData
from app.dtos import SearchParams, PaginatedResponse
from app.api.deps import SessionDep
from app.services import redis_service
from app.services.redis_service import RedisService
import app.crud as crud

router = APIRouter()


@router.get("/search_business", response_model=PaginatedResponse)
async def search_business(db: SessionDep, params: SearchParams = Depends()):
    total_count, results = crud.search_companies_elastic(params)
    total_pages = (total_count + params.items_per_page - 1) // params.items_per_page

    return PaginatedResponse(
        items=results,
        total_count=total_count,
        page=params.page,
        items_per_page=params.items_per_page,
        total_pages=total_pages
    )


@router.get("/get_business_info", response_model=list[GukminYungumData])
async def get_business_info(hash: str, db: SessionDep, redis_service: RedisService = Depends()):
    results = None
    if hash:
        results = crud.get_business_info(db, hash)
        if results:
            # Redis 저장 test
            redis_service.add_recent_search(results[0])

    return results


@router.get("/get_recent_search", response_model=list[GukminYungumData])
async def get_recent_search(redis_service: RedisService = Depends()):
    searches = redis_service.get_recent_searches()
    return searches
