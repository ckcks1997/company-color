from sqlmodel import Session, select
from elasticsearch import Elasticsearch
from sqlalchemy import not_, or_
from app.dtos import SearchParams, SearchResponse
from app.models import GukminYungumData, Corpcode
from app.core.config import settings
from app.core.logging_config import logger
from app.core.constants import (
    DEFAULT_SEARCH_PERIOD, EXTENDED_SEARCH_PERIOD,
    RANK_RESULT_LIMIT, RANK_EXCLUDED_COMPANY_PATTERNS,
    DART_CORP_SEARCH_LIMIT, COMPANY_NAME_STRIP_PATTERNS,
    ES_MIN_SCORE, ES_INDEX_NAME,
)

es = Elasticsearch(
    [settings["ELASTIC_HOST"]],
    basic_auth=(settings["ELASTIC_USERNAME"], settings["ELASTIC_PASSWORD"]),
    verify_certs=False,
    ssl_show_warn=False,
)


def normalize_company_name(name: str) -> str:
    """회사명 정규화 (법인 접두/접미사 제거)"""
    name = name.strip()
    for pattern in COMPANY_NAME_STRIP_PATTERNS:
        name = name.replace(pattern, "")
    return name


async def get_business_info(db: Session, hash: str, period: str):
    """특정 해시값을 가진 회사의 국민연금 정보"""
    search_range = EXTENDED_SEARCH_PERIOD if period == '2y' else DEFAULT_SEARCH_PERIOD

    query = (select(GukminYungumData)
             .filter(GukminYungumData.hash == hash)
             .order_by(GukminYungumData.created_dt.desc())
             .limit(search_range))
    return db.exec(query).all()


async def get_rank_info(db: Session, ymonth: str, type: str):
    """특정 년월 및 타입에 따른 국민연금 가입자 순위"""
    order_column = (
        GukminYungumData.subscriber_quit if type == 'quit'
        else GukminYungumData.subscriber_new
    )

    excluded_conditions = or_(
        *[GukminYungumData.company_nm.like(pattern) for pattern in RANK_EXCLUDED_COMPANY_PATTERNS]
    )

    query = (
        select(GukminYungumData)
        .filter(
            GukminYungumData.created_dt == ymonth,
            not_(excluded_conditions)
        )
        .order_by(order_column.desc())
        .limit(RANK_RESULT_LIMIT)
    )

    return db.exec(query).all()


async def get_dart_info(db: Session, corp_name: str):
    """회사명으로 DART 정보 검색"""
    corp_name = normalize_company_name(corp_name)

    query = (select(Corpcode)
             .filter(Corpcode.corp_name == corp_name)
             .limit(DART_CORP_SEARCH_LIMIT))
    return db.exec(query).all()


async def search_companies_elastic(params: SearchParams):
    """Elasticsearch를 사용하여 회사 정보 검색"""
    must_conditions = []
    must_not_conditions = []

    # 지역 선택시
    if params.location:
        must_conditions.append({
            "term": {
                "Location": params.location
            }
        })

    # 가입자 0인 데이터 제외
    must_not_conditions.append({
        "term": {
            "Subscriber": 0
        }
    })

    query = {
        "function_score": {
            "query": {
                "bool": {
                    "must": must_conditions,
                    "must_not": must_not_conditions,
                    "should": [
                        {
                            "match_phrase": {
                                "CompanyNm.keyword": {
                                  "query": f"{params.business_name}",
                                  "boost": 3
                                }
                            }
                        },
                        {
                            "match_phrase": {
                                "CompanyNm": {
                                    "query": f"{params.business_name}",
                                    "boost": 2,
                                    "slop": 10
                                }
                            }
                        },
                        {
                            "match": {
                                "CompanyNm.ngram": {
                                    "query": f"{params.business_name}",
                                    "operator": "and",
                                    "boost": 1
                                }
                            }
                        }
                    ],
                    "minimum_should_match": 1
                }
            },
            "field_value_factor": {
                "field": "Subscriber",
                "factor": 0.1,
                "modifier": "log1p",
                "missing": 1
            },
            "boost_mode": "multiply"
        }
    }

    sort = [
        {"_score": {"order": "desc"}},
        {"Subscriber": {"order": "desc"}}
    ]

    if params.sort == 'subscriber':
        sort = [
            {"Subscriber": {"order": "desc"}},
            {"_score": {"order": "desc"}}
        ]

    try:
        response = es.search(
            index=ES_INDEX_NAME,
            body={
                "query": query,
                "sort": sort,
                "min_score": ES_MIN_SCORE,
                "from": (params.page - 1) * params.items_per_page,
                "size": params.items_per_page
            }
        )

        total_count = response['hits']['total']['value']
        results = [SearchResponse(
            company_nm=hit['_source']['CompanyNm'],
            address=hit['_source']['Address'],
            location=hit['_source']['Location'],
            hash=hit['_source']['Hash'],
            subscriber=hit['_source']['Subscriber']
        ) for hit in response['hits']['hits']]

        return total_count, results
    except Exception as e:
        logger.error(f"Elasticsearch search error: {str(e)}")
        return 0, []
