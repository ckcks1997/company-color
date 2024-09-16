from pydantic import BaseModel
from app.models.tCompanyInfo import CompanyInfo


class Token(BaseModel):
    access_token: str
    token_type: str


class SearchParams(BaseModel):
    business_name: str
    location: str | None = None
    page: int = 1
    items_per_page: int = 30
    sort: str | None = None


class PaginatedResponse(BaseModel):
    items: list[object]
    total_count: int
    page: int
    items_per_page: int
    total_pages: int


class SearchResponse(BaseModel):
    company_nm: str
    address: str
    location: str
    hash: str
    subscriber: int
