'use client'

/**
 * 인증 관련 API 호출.
 * 토큰은 httpOnly 쿠키로만 다루고, JS 측에서 직접 보관하지 않는다.
 */

import apiClient from './axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1'

export interface AuthMe {
  id: number
  type: string
  nickname: string
  last_login_at: string | null
}

interface MeResponse {
  user: AuthMe | null
}

/**
 * 카카오 로그인 — 백엔드 OAuth 시작점으로 풀-페이지 이동.
 * 콜백 후 백엔드가 쿠키를 발급하고 프론트로 리다이렉트한다.
 */
export const goKakaoLogin = (): void => {
  if (typeof window === 'undefined') return
  window.location.href = `${API_BASE_URL}/auth/kakao/login`
}

/** 현재 로그인한 사용자 정보 — 비로그인이면 ``null``. */
export const fetchMe = async (): Promise<AuthMe | null> => {
  const response = await apiClient.get<MeResponse>('/auth/me')
  return response.data.user
}

/** access 쿠키 갱신. */
export const refreshSession = async (): Promise<void> => {
  await apiClient.post('/auth/refresh', {})
}

/** 로그아웃 — 서버가 쿠키를 만료시킨다. */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout', {})
}
