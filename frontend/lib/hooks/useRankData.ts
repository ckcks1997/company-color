'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { fetchRankData } from '@/lib/api/client'
import type { RankDataItem, RankType } from '@/lib/api/types'

/**
 * 순위 데이터 조회 Hook
 */
export function useRankData(
  ymonth: string | null | undefined,
  searchType: RankType | null | undefined
): UseQueryResult<RankDataItem[]> {
  return useQuery({
    queryKey: ['rank', ymonth, searchType],
    queryFn: () => fetchRankData(ymonth as string, searchType as RankType),
    enabled: !!ymonth && !!searchType,
    staleTime: 1000 * 60 * 60, // 1시간
    gcTime: 1000 * 60 * 60 * 2, // 2시간
  })
}
