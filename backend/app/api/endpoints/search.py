from fastapi import APIRouter, Depends
from app.models import GukminYungumData, Corpcode
from app.dtos import SearchParams, PaginatedResponse
from app.api.deps import SessionDep
import app.crud as crud
import requests
import os
from app.core.logging_config import logger

router = APIRouter()
API_KEY = os.getenv("DART_KEY")

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
async def get_business_info(hash: str, db: SessionDep):
    results = None
    if hash:
        results = await crud.get_business_info(db, hash)

    return results

@router.get("/get_rank_info", response_model=list[GukminYungumData])
async def get_business_info(ymonth: str, type:str, db: SessionDep):
    results = None
    if hash:
        results = await crud.get_rank_info(db, ymonth, type)

    return results

@router.get("/get_dart_info", response_model=list)
async def get_dart_info(name: str, db: SessionDep):
    name = name.strip().replace("(주)", "").replace("주식회사","")
    searches =  await crud.get_dart_info(db, name)
    code_list = [v.corp_code for v in searches]
    documents = []

    for corp_code in code_list:
        url = (f"https://opendart.fss.or.kr/api/list.json?crtfc_key={API_KEY}"
               f"&corp_code={corp_code}"
               f"&bgn_de=20230101"
               f"&page_no=1"
               f"&page_count=100")

        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data['status'] != '013':
                documents.extend(data["list"])
        else:
            logger.info({"error": f"Failed to fetch data for corp_code: {corp_code}"})
    logger.info('----dart result----')
    logger.info(documents)
    filtered_doc = [d for d in documents
                    if "감사" in d["report_nm"]
                    or "해산" in d["report_nm"]
                    or "분기보고서" in d["report_nm"]
                    or "연1회공시" in d["report_nm"]
                    ]

    return filtered_doc
