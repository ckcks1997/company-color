/**
 * 서버 컴포넌트 전용 API 클라이언트.
 *
 * 클라이언트용 `lib/api/client.ts` 는 axios(+쿠키 인증) 기반이라 서버에서 쓸 수 없다.
 * 여기서는 Next 의 fetch 캐시(revalidate)를 그대로 활용하기 위해 순수 fetch 만 사용한다.
 */

import { API_BASE_URL } from './constants'
import type { BusinessDataItem } from './types'

/** 상세 데이터 재검증 주기(초). 국민연금 데이터가 월 단위로 갱신되므로 1시간이면 충분하다. */
const BUSINESS_DATA_REVALIDATE = 3600

/** sitemap 은 크롤러만 읽으므로 더 길게 캐싱한다. */
const SITEMAP_REVALIDATE = 86400

export interface SitemapSummary {
  total_count: number
  min_id: number
  max_id: number
}

export interface SitemapCompanyItem {
  id: number
  hash: string
}

export interface SitemapCompaniesResponse {
  items: SitemapCompanyItem[]
  next_cursor: number | null
}

/** 클라이언트 `fetchBusinessData` 와 동일한 period 파라미터 규칙 */
function toPeriodParam(period: number): string {
  if (period === 36) return '3y'
  if (period === 24) return '2y'
  return String(period)
}

async function getJson<T>(path: string, revalidate: number): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate },
  })

  if (!response.ok) {
    throw new Error(`API ${path} 응답 실패 (${response.status})`)
  }

  return (await response.json()) as T
}

/**
 * 기업 상세(국민연금) 데이터를 서버에서 조회한다.
 * 동일 요청 내에서 generateMetadata 와 페이지 렌더가 함께 호출해도 Next 의 fetch 중복 제거로 1회만 나간다.
 */
export async function fetchBusinessDataServer(
  hash: string,
  period: number = 12
): Promise<BusinessDataItem[]> {
  const data = await getJson<BusinessDataItem[]>(
    `/get_business_info?hash=${encodeURIComponent(hash)}&period=${toPeriodParam(period)}`,
    BUSINESS_DATA_REVALIDATE
  )
  return Array.isArray(data) ? data : []
}

export async function fetchSitemapSummary(): Promise<SitemapSummary> {
  return getJson<SitemapSummary>('/sitemap/summary', SITEMAP_REVALIDATE)
}

export async function fetchSitemapCompanies(params: {
  afterId: number
  maxId?: number
  limit: number
}): Promise<SitemapCompaniesResponse> {
  const query = new URLSearchParams({
    after_id: String(params.afterId),
    limit: String(params.limit),
  })
  if (params.maxId !== undefined) query.set('max_id', String(params.maxId))

  return getJson<SitemapCompaniesResponse>(
    `/sitemap/companies?${query.toString()}`,
    SITEMAP_REVALIDATE
  )
}
