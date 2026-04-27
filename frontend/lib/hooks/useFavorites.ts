'use client'

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'
import {
  addFavorite,
  listFavoriteHashes,
  listFavorites,
  removeFavorite,
  type FavoriteItem,
} from '@/lib/api/me'
import type { PaginatedResponse } from '@/lib/api/types'
import { useAuth } from './useAuth'

const FAVORITES_HASHES_KEY = ['me', 'favorites', 'hashes'] as const
const favoritesPageKey = (page: number, itemsPerPage: number) =>
  ['me', 'favorites', 'page', { page, itemsPerPage }] as const

/** 마이페이지 — 페이지네이션된 즐겨찾기 목록. */
export function useFavorites(
  page: number = 1,
  itemsPerPage: number = 30,
  enabled: boolean = true
): UseQueryResult<PaginatedResponse<FavoriteItem>> {
  return useQuery({
    queryKey: favoritesPageKey(page, itemsPerPage),
    queryFn: () => listFavorites(page, itemsPerPage),
    enabled,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
  })
}

/**
 * 본인 즐겨찾기의 hash 전체를 Set 으로 캐싱.
 * 검색 결과/상세 페이지에서 별 아이콘 채움 여부 lookup 에 사용.
 */
export function useFavoriteHashes(): {
  hashes: Set<string>
  isLoading: boolean
} {
  const { isLoggedIn } = useAuth()
  const query = useQuery({
    queryKey: FAVORITES_HASHES_KEY,
    queryFn: listFavoriteHashes,
    enabled: isLoggedIn,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
  })
  return {
    hashes: new Set(query.data ?? []),
    isLoading: query.isLoading,
  }
}

/**
 * 회사 단건의 즐겨찾기 상태 + 토글.
 *
 * - 비로그인 사용자에게는 ``isLoggedIn=false`` 만 반환하고 토글은 noop.
 * - 토글은 hash set 캐시에 낙관적 업데이트 → 서버 응답 후 invalidate 로 정합성 회복.
 * - 백엔드 unique constraint 위반(이미 추가된 항목)은 토스트 안내는 호출자(컴포넌트)가
 *   훅이 아니라 mutation 결과를 직접 처리하지 않고, 여기선 invalidate 로 자동 정합.
 */
export function useFavoriteToggle(
  hash: string,
  companyNm?: string | null
): {
  isLoggedIn: boolean
  isFavorite: boolean
  isPending: boolean
  toggle: () => Promise<void>
} {
  const { isLoggedIn } = useAuth()
  const queryClient = useQueryClient()
  const { hashes } = useFavoriteHashes()

  const isFavorite = hashes.has(hash)

  const setHashesCache = (updater: (prev: string[]) => string[]) => {
    queryClient.setQueryData<string[]>(FAVORITES_HASHES_KEY, (prev) => updater(prev ?? []))
  }

  const addMutation = useMutation({
    mutationFn: () => addFavorite(hash, companyNm ?? null),
    onMutate: () => {
      const previous = queryClient.getQueryData<string[]>(FAVORITES_HASHES_KEY) ?? []
      setHashesCache((p) => (p.includes(hash) ? p : [...p, hash]))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITES_HASHES_KEY, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_HASHES_KEY })
      queryClient.invalidateQueries({ queryKey: ['me', 'favorites', 'page'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: () => removeFavorite(hash),
    onMutate: () => {
      const previous = queryClient.getQueryData<string[]>(FAVORITES_HASHES_KEY) ?? []
      setHashesCache((p) => p.filter((h) => h !== hash))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITES_HASHES_KEY, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_HASHES_KEY })
      queryClient.invalidateQueries({ queryKey: ['me', 'favorites', 'page'] })
    },
  })

  const toggle = async () => {
    if (!isLoggedIn) return
    if (isFavorite) {
      await removeMutation.mutateAsync()
    } else {
      await addMutation.mutateAsync()
    }
  }

  return {
    isLoggedIn,
    isFavorite,
    isPending: addMutation.isPending || removeMutation.isPending,
    toggle,
  }
}

export { FAVORITES_HASHES_KEY }
