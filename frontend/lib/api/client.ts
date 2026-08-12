'use client'

/**
 * 클라이언트 컴포넌트에서 사용할 API 클라이언트.
 * 인증은 httpOnly 쿠키로 처리되므로 토큰을 JS 에서 다루지 않는다.
 */

import apiClient from './axios'
import { API_BASE_URL } from './constants'
import type {
  BusinessDataItem,
  PaginatedResponse,
  RankDataItem,
  RankType,
  ReplyPostResponse,
  SearchResultItem,
} from './types'

/**
 * 댓글 등록 — 로그인 필요. 비로그인 사용자는 401 을 받는다.
 */
export async function postReply(hash: string, value: string): Promise<ReplyPostResponse> {
  const response = await apiClient.post<ReplyPostResponse>('/reply', { hash, value })
  return response.data
}

/**
 * 비즈니스(국민연금) 데이터 조회.
 */
export async function fetchBusinessData(
  hash: string,
  period: number = 12
): Promise<BusinessDataItem[]> {
  const periodParam = period === 36 ? '3y' : period === 24 ? '2y' : period
  const response = await apiClient.get<BusinessDataItem[]>(
    `/get_business_info?hash=${hash}&period=${periodParam}`
  )
  return response.data
}

/**
 * 검색 결과 조회.
 */
export async function fetchSearchResults(
  businessName: string,
  location?: string,
  page?: number
): Promise<PaginatedResponse<SearchResultItem>> {
  const params = new URLSearchParams({ business_name: businessName })
  if (location) params.set('location', location)
  if (page) params.set('page', String(page))

  const response = await apiClient.get<PaginatedResponse<SearchResultItem>>(
    `/search_business?${params.toString()}`
  )
  return response.data
}

/**
 * 순위 데이터 조회.
 */
export async function fetchRankData(
  ymonth: string,
  searchType: RankType
): Promise<RankDataItem[]> {
  const response = await apiClient.get<RankDataItem[]>(
    `/get_rank_info?ymonth=${ymonth}&type=${searchType}`
  )
  return response.data
}

export { API_BASE_URL }
