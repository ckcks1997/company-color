from datetime import datetime
from sqlmodel import Session, select
from elasticsearch import Elasticsearch
from sqlalchemy import and_
from app.models import GukminYungumData, Users
from app.dtos import SearchParams, SearchResponse
from app.core.config import elastic_settings

es = Elasticsearch([elastic_settings.ELASTIC_HOST])


def get_business_info(db: Session, hash: str):
    query = (select(GukminYungumData)
             .filter(
        and_(
            GukminYungumData.hash == hash,
            GukminYungumData.created_dt >= '2023-08'
        )
    )
             .order_by(GukminYungumData.created_dt))
    return db.exec(query).all()


async def get_or_create_user(db: Session, user_info: dict):
    social_key = str(user_info["id"])
    stmt = select(Users).where(Users.SOCIAL_KEY == social_key)
    result = db.exec(stmt).first()

    if result:
        user = result
        user.LAST_LOGIN_AT = datetime.now()
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    else:
        # 새 사용자 생성
        new_user = Users(
            TYPE="kakao",
            SOCIAL_KEY=social_key,
            NICKNAME='',
            LAST_LOGIN_AT=datetime.now()
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user


def search_companies_elastic(params: SearchParams):
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
                                "CompanyNm": f"{params.business_name}"
                            }
                        },
                        {
                            "match": {
                                "CompanyNm": {
                                    "query": f"{params.business_name}",
                                    "operator": "and",
                                    "boost": 2
                                }
                            }
                        },
                        {
                            "match": {
                                "CompanyNm.ngram": {
                                    "query": f"{params.business_name}",
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
                "factor": 0.05,
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

    response = es.search(
        index="company_color_search_idx",
        body={
            "query": query,
            "sort": sort,
            "min_score": 10.0,
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
