import httpx
from fastapi import HTTPException
from typing import List, Dict, Any, Optional
from app.core.logging_config import logger
from app.core.config import settings

class DartClient:
    """DART 오픈 API 클라이언트"""

    def __init__(self):
        self.api_key = settings["DART_KEY"]
        if not self.api_key:
            logger.error("DART API 키가 설정되지 않았습니다.")
            raise ValueError("DART API 키가 설정되지 않았습니다.")
        self.base_url = "https://opendart.fss.or.kr/api"
        
    async def get_disclosure_list(self, corp_code: str, start_date: str = "20230101") -> List[Dict[str, Any]]:
        """
        특정 기업의 공시 목록을 가져옵니다.
        
        Args:
            corp_code: 기업 고유번호
            start_date: 조회 시작일(YYYYMMDD) 형식
            
        Returns:
            공시 목록 리스트
            
        Raises:
            HTTPException: API 호출 오류 발생 시
        """
        url = f"{self.base_url}/list.json"
        params = {
            "crtfc_key": self.api_key,
            "corp_code": corp_code,
            "bgn_de": start_date,
            "page_no": 1,
            "page_count": 100
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10.0)
                
            if response.status_code != 200:
                logger.error(f"DART API 오류: status={response.status_code}, corp_code={corp_code}")
                return []
                
            data = response.json()
            
            # 정상적인 응답이 아닐 경우
            if data.get('status') == '013':  # 조회된 데이터가 없음
                return []
                
            if "list" not in data:
                logger.warning(f"DART API 응답에 list 키가 없음: {data}")
                return []
                
            return data["list"]
                
        except httpx.TimeoutException:
            logger.error(f"DART API 타임아웃: corp_code={corp_code}")
            return []
        except Exception as e:
            logger.error(f"DART API 호출 중 오류 발생: {str(e)}, corp_code={corp_code}")
            return []
            
    def filter_disclosure_by_keywords(self, documents: List[Dict[str, Any]], 
                                     keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        키워드를 포함하는 공시문서만 필터링합니다.
        
        Args:
            documents: 공시 문서 리스트
            keywords: 포함될 키워드 리스트 (기본값: ["감사", "해산", "분기보고서", "연1회공시"])
            
        Returns:
            필터링된 공시 문서 리스트
        """
        if not keywords:
            keywords = ["감사", "해산", "분기보고서", "연1회공시"]
            
        return [doc for doc in documents if any(keyword in doc.get("report_nm", "") for keyword in keywords)]