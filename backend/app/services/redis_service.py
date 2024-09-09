import redis
from fastapi import Depends
from functools import lru_cache
from app.core.config import redis_Settings
import json

RECENT_SEARCHES_KEY = "recent_searches"
MAX_RECENT_SEARCHES = 10


@lru_cache()
def get_redis_client():
    return redis.Redis(
        host=redis_Settings.REDIS_HOST,
        port=redis_Settings.REDIS_PORT,
        password=redis_Settings.REDIS_PASSWORD,
        db=redis_Settings.REDIS_DB,
    )

class RedisService:
    def __init__(self, redis_client: redis.Redis = Depends(get_redis_client)):
        self.redis = redis_client

    def add_recent_search(self, company_results):
        result_dict = company_results.dict()
        rseult_json = json.dumps(result_dict)
        # 중복 제거 (이미 있으면 삭제)
        self.redis.lrem(RECENT_SEARCHES_KEY, 0, rseult_json)

        # 리스트 앞에 추가
        self.redis.lpush(RECENT_SEARCHES_KEY, rseult_json)

        # 최대 개수 유지
        self.redis.ltrim(RECENT_SEARCHES_KEY, 0, MAX_RECENT_SEARCHES - 1)

    def get_recent_searches(self):
        json_list = self.redis.lrange(RECENT_SEARCHES_KEY, 0, -1)
        return [json.loads(item.decode('utf-8')) for item in json_list]
