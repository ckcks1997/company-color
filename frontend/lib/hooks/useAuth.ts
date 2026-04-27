'use client'

import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import {
  fetchMe,
  goKakaoLogin,
  logout as logoutApi,
  type AuthMe,
} from '@/lib/api/auth'

const ME_QUERY_KEY = ['auth', 'me'] as const

/** 현재 로그인한 사용자 — 비로그인이면 ``user === null``, ``isLoggedIn === false``. */
export function useAuth(): {
  user: AuthMe | null | undefined
  isLoading: boolean
  isLoggedIn: boolean
  query: UseQueryResult<AuthMe | null>
} {
  const query = useQuery<AuthMe | null>({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  })

  return {
    user: query.data,
    isLoading: query.isLoading,
    isLoggedIn: !!query.data,
    query,
  }
}

/** 카카오 로그인 진입. */
export function useKakaoLogin(): () => void {
  return goKakaoLogin
}

/** 로그아웃 — 서버에 쿠키 제거 요청 후 me 캐시 무효화. */
export function useLogout(): () => Promise<void> {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ME_QUERY_KEY })
      queryClient.invalidateQueries()
    },
  })
  return async () => {
    await mutation.mutateAsync()
  }
}

export { ME_QUERY_KEY }
