'use client'

import { useQuery } from '@tanstack/react-query';
import { fetchRankData } from '@/lib/api/client';

/**
 * 순위 데이터 조회 Hook
 * @param {string} ymonth - 연월 (YYYY-MM)
 * @param {string} searchType - 검색 유형 (quit/new)
 */
export function useRankData(ymonth, searchType) {
  return useQuery({
    queryKey: ['rank', ymonth, searchType],
    queryFn: () => fetchRankData(ymonth, searchType),
    enabled: !!ymonth && !!searchType,
    staleTime: 1000 * 60 * 60, // 1시간
    cacheTime: 1000 * 60 * 60 * 2, // 2시간
  });
}
