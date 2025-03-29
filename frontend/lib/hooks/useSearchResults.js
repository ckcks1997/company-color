'use client'

import { useQuery } from '@tanstack/react-query';
import { fetchSearchResults } from '@/lib/api/client';

/**
 * 검색 결과 조회 Hook
 * @param {string} businessName - 회사명
 * @param {string} location - 지역
 * @param {number} page - 페이지 번호
 */
export function useSearchResults(businessName, location, page) {
  return useQuery({
    queryKey: ['search', businessName, location, page],
    queryFn: () => fetchSearchResults(businessName, location, page),
    enabled: !!businessName,
    staleTime: 1000 * 60 * 5, // 5분
    cacheTime: 1000 * 60 * 30, // 30분
    keepPreviousData: true, // 페이지네이션 시 이전 데이터 유지
  });
}
