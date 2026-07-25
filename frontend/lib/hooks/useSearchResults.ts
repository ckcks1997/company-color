'use client'

import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query'
import { fetchSearchResults } from '@/lib/api/client'
import type { PaginatedResponse, SearchResultItem } from '@/lib/api/types'

/**
 * 검색 결과 조회 Hook
 */
export function useSearchResults(
  businessName: string | null | undefined,
  location?: string,
  page?: number
): UseQueryResult<PaginatedResponse<SearchResultItem>> {
  return useQuery({
    queryKey: ['search', businessName, location, page],
    queryFn: () => fetchSearchResults(businessName as string, location, page),
    enabled: !!businessName,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
    placeholderData: keepPreviousData, // 페이지네이션 시 이전 데이터 유지
  })
}
