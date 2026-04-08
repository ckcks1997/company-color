"""
애플리케이션 상수 정의 모듈
"""

# 검색 기간 관련
DEFAULT_SEARCH_PERIOD = 12
EXTENDED_SEARCH_PERIOD = 24
MAX_SEARCH_PERIOD = 36

# 순위 조회
RANK_RESULT_LIMIT = 50

# DART 관련
DART_CORP_SEARCH_LIMIT = 12
DART_DEFAULT_START_DATE = "20230101"
DART_FILTER_KEYWORDS = ["감사", "해산", "분기보고서", "연1회공시"]
DART_PAGE_COUNT = 100

# Elasticsearch 관련
ES_MIN_SCORE = 3.0
ES_INDEX_NAME = "company_color_search_idx"

# 순위 제외 회사명 패턴 (SQL LIKE 패턴)
RANK_EXCLUDED_COMPANY_PATTERNS = [
    "쿠팡풀필먼트%",
    "중앙경찰학교(신임)",
]

# 회사명 정규화에서 제거할 문자열
COMPANY_NAME_STRIP_PATTERNS = ["(주)", "주식회사"]
