// 백엔드 (FastAPI) 응답 스키마 — backend/app/dtos.py 와 backend/app/models 기준.
// Phase 3.3 에서 OpenAPI 자동 생성으로 대체 예정.

export interface PaginatedResponse<T> {
  items: T[]
  total_count: number
  page: number
  items_per_page: number
  total_pages: number
}

export interface SearchResultItem {
  company_nm: string
  address: string
  location: string
  hash: string
  subscriber: number
}

export interface BusinessDataItem {
  id: number | null
  created_dt: string
  company_nm: string
  business_num: string
  business_reg_status: number
  business_location: string
  business_location_specific: string
  business_type_code: number
  business_code: string
  industry_code: string
  applied_date: string
  withdrawal_date: string
  subscriber_cnt: number
  monthly_payment_amt: string
  subscriber_new: number
  subscriber_quit: number
  hash: string
}

export type RankDataItem = BusinessDataItem

export interface ReplyItem {
  idx: number | null
  hash: string
  reply: string
  users_id: string
  use_yn: string | null
  created_at: string | null
}

// DART 응답은 백엔드에서 외부 API의 raw payload 를 그대로 반환하므로 loosely typed.
export interface DartDocument {
  corp_code?: string
  corp_name?: string
  report_nm?: string
  rcept_no?: string
  rcept_dt?: string
  flr_nm?: string
  rm?: string
  [key: string]: unknown
}

export interface ReplyPostResponse {
  status: string
  message: string
}

export type RankType = 'new' | 'quit'

export type Period = 12 | 24 | 36
