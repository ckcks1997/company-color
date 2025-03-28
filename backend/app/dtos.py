from typing import Optional, List, Generic, TypeVar, Any
from pydantic import BaseModel, Field,  field_validator
from datetime import datetime

T = TypeVar('T')

class Token(BaseModel):
    """인증 토큰 모델"""
    access_token: str
    token_type: str
    expires_in: int = Field(..., description="토큰 만료 시간(초)")
    user_id: int = Field(..., description="사용자 ID")


class TokenData(BaseModel):
    """토큰 데이터 모델"""
    sub: str
    type: str
    exp: datetime


class SearchParams(BaseModel):
    """검색 매개변수 모델"""
    business_name: str = Field(..., description="검색할 회사명", min_length=1)
    location: Optional[str] = Field(None, description="지역 필터")
    page: int = Field(1, description="페이지 번호", ge=1)
    items_per_page: int = Field(30, description="페이지당 항목 수", ge=5, le=100)
    sort: Optional[str] = Field(None, description="정렬 방식 (subscriber: 가입자 수 기준)")

    @field_validator('business_name')
    def validate_business_name(cls, v):
        """회사명 유효성 검사"""
        if not v or not v.strip():
            raise ValueError("검색어를 입력해주세요")
        return v.strip()


class PaginatedResponse(BaseModel, Generic[T]):
    """페이지네이션 응답 모델"""
    items: List[T]
    total_count: int = Field(..., description="전체 항목 수")
    page: int = Field(..., description="현재 페이지 번호")
    items_per_page: int = Field(..., description="페이지당 항목 수")
    total_pages: int = Field(..., description="전체 페이지 수")


class SearchResponse(BaseModel):
    """검색 결과 모델"""
    company_nm: str = Field(..., description="회사명")
    address: str = Field(..., description="주소")
    location: str = Field(..., description="지역")
    hash: str = Field(..., description="고유 해시값")
    subscriber: int = Field(..., description="가입자 수")


class Reply(BaseModel):
    """댓글 모델"""
    access_token: Optional[str] = Field(None, description="인증 토큰")
    hash: Optional[str] = Field(None, description="회사 해시값")
    value: Optional[str] = Field(None, description="댓글 내용", min_length=1, max_length=1000)

    @field_validator('hash')
    def validate_hash(cls, v):
        """해시값 유효성 검사"""
        if not v or not v.strip():
            raise ValueError("회사 해시값이 필요합니다")
        return v

    @field_validator('value')
    def validate_value(cls, v):
        """댓글 내용 유효성 검사"""
        if not v or not v.strip():
            raise ValueError("댓글 내용을 입력해주세요")
        return v.strip()
