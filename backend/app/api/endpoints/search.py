from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.models import GukminYungumData, Corpcode
from app.dtos import SearchParams, PaginatedResponse
from app.api.deps import SessionDep
import app.crud as crud
from app.services.dart_client import DartClient
from app.core.logging_config import logger
from app.core.exceptions import NotFoundException, ExternalAPIException

router = APIRouter(prefix="/api/v1",tags=["search"])
dart_client = DartClient()

@router.get("/search_business", response_model=PaginatedResponse, summary="회사 검색")
async def search_business(db: SessionDep, params: SearchParams = Depends()):
    """
    회사 정보 검색
    
    - **business_name**: 검색할 회사명 (필수)
    - **location**: 지역 필터링 (선택)
    - **page**: 페이지 번호 (기본값: 1)
    - **items_per_page**: 페이지당 항목 수 (기본값: 30)
    - **sort**: 정렬 기준 (기본값: null, 'subscriber'로 설정 시 가입자 수 기준 정렬)
    
    Returns:
        검색 결과 및 페이지네이션 정보
    """
    if not params.business_name:
        raise HTTPException(status_code=400, detail="검색어를 입력해주세요")
        
    total_count, results = await crud.search_companies_elastic(params)
    total_pages = (total_count + params.items_per_page - 1) // params.items_per_page if total_count > 0 else 0

    return PaginatedResponse(
        items=results,
        total_count=total_count,
        page=params.page,
        items_per_page=params.items_per_page,
        total_pages=total_pages
    )


@router.get("/get_business_info", response_model=List[GukminYungumData], summary="회사 상세 정보")
async def get_business_info(hash: str, db: SessionDep):
    """
    특정 회사의 국민연금 상세 정보 조회
    
    - **hash**: 회사 고유 해시값 (필수)
    
    Returns:
        회사의 국민연금 데이터 목록
    """
    if not hash:
        raise HTTPException(status_code=400, detail="회사 해시값이 필요합니다")
        
    results = await crud.get_business_info(db, hash)
    
    if not results:
        raise NotFoundException(detail=f"해당 해시값({hash})의 정보를 찾을 수 없습니다")
        
    return results


@router.get("/get_rank_info", response_model=List[GukminYungumData], summary="순위 정보")
async def get_rank_info(ymonth: str, type: str, db: SessionDep):
    """
    특정 달의 국민연금 순위 정보조회
    
    - **ymonth**: 조회 년월 (예: '2023-01')
    - **type**: 순위 유형 ('new': 입사율, 'quit': 퇴사율)
    
    Returns:
        순위별 국민연금 데이터 목록
    """
    if not ymonth:
        raise HTTPException(status_code=400, detail="조회 년월을 입력해주세요")
        
    if not type or type not in ['new', 'quit']:
        raise HTTPException(status_code=400, detail="유효한 순위 유형을 입력해주세요 (new 또는 quit)")
        
    results = await crud.get_rank_info(db, ymonth, type)
    
    if not results:
        logger.warning(f"순위 정보 없음: ymonth={ymonth}, type={type}")
        
    return results


@router.get("/get_dart_info", summary="DART 공시 정보")
async def get_dart_info(name: str, db: SessionDep):
    """
    DART 정보 조회
    
    - **name**: 회사명 (필수)
    
    Returns:
        공시 정보 목록
    """
    if not name:
        raise HTTPException(status_code=400, detail="회사명을 입력해주세요")
        
    # 회사명 전처리
    name = name.strip().replace("(주)", "").replace("주식회사", "")
    
    # DB에서 회사 코드 조회
    searches = await crud.get_dart_info(db, name)
    
    if not searches:
        logger.info(f"DART 정보 없음: name={name}")
        return []
        
    code_list = [v.corp_code for v in searches]
    all_documents = []
    
    # 각 회사 코드별로 공시 정보 조회
    for corp_code in code_list:
        documents = await dart_client.get_disclosure_list(corp_code)
        all_documents.extend(documents)
        
    logger.info(f"DART 검색 결과 수: {len(all_documents)}, name={name}, 회사 코드 수={len(code_list)}")
    
    # 키워드 필터링
    filtered_docs = dart_client.filter_disclosure_by_keywords(all_documents)
    
    return filtered_docs