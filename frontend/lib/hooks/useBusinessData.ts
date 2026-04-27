'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { fetchBusinessData } from '@/lib/api/client'
import type { BusinessDataItem } from '@/lib/api/types'

/**
 * 비즈니스(국민연금) 데이터 조회 Hook
 */
export function useBusinessData(
  hash: string | null | undefined,
  period: number = 12
): UseQueryResult<BusinessDataItem[]> {
  return useQuery({
    queryKey: ['business', hash, period],
    queryFn: () => fetchBusinessData(hash as string, period),
    enabled: !!hash,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
  })
}
