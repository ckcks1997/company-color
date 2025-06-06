'use client'

import { useQuery } from '@tanstack/react-query';
import { fetchBusinessData } from '@/lib/api/client';

/**
 * 비즈니스 정보 조회 Hook
 * @param {string} hash - 회사 해시
 */
export function useBusinessData(hash) {
  return useQuery({
    queryKey: ['business', hash],
    queryFn: () => fetchBusinessData(hash),
    enabled: !!hash,
    staleTime: 1000 * 60 * 5, // 5분
    cacheTime: 1000 * 60 * 30, // 30분
  });
}
