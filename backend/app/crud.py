from datetime import datetime
from sqlmodel import Session, select
from app.models import GukminYungumData, CompanyInfo
from elasticsearch import Elasticsearch
from sqlalchemy import and_, case, func
from app.models.tUsers import Users
from dtos import SearchParams

es = Elasticsearch(['http://10.0.0.5:9200'])


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

    if params.location:
        must_conditions.append({
            "term": {
                "Location": params.location
            }
        })

    query = {
        "bool": {
            "must": must_conditions,
            "should": [
                {
                    "wildcard": {
                        "CompanyNm": f"*{params.business_name}*"
                    }
                }
            ]
        }
    }

    response = es.search(
        index="company_color_search_idx",
        body={
            "query": query,
            "sort": [
                {"_score": {"order": "desc"}},
                #{"CompanyNm.keyword": {"order": "asc"}}
            ],
            "from": (params.page - 1) * params.items_per_page,
            "size": params.items_per_page
        }
    )

    total_count = response['hits']['total']['value']
    results = [CompanyInfo(
        company_nm=hit['_source']['CompanyNm'],
        location=hit['_source']['Location'],
        hash=hit['_source']['Hash']
    ) for hit in response['hits']['hits']]

    return total_count, results