'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { api } from '@/lib/api/api'
import type { DartDocument } from '@/lib/api/types'

/**
 * DART 공시 데이터 조회 Hook
 */
export function useDartData(
  companyName: string | null | undefined
): UseQueryResult<DartDocument[]> {
  return useQuery({
    queryKey: ['dart', companyName],
    queryFn: () => api.fetchDartData(companyName as string),
    enabled: !!companyName,
    staleTime: 1000 * 60 * 30, // 30분
    gcTime: 1000 * 60 * 60, // 1시간
  })
}
