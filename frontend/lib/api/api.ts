import type { AxiosRequestConfig } from 'axios'
import apiClient from './axios'
import type {
  BusinessDataItem,
  DartDocument,
  PaginatedResponse,
  RankDataItem,
  ReplyItem,
  SearchResultItem,
} from './types'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1'

const KAKAO_CLIENT_ID = `${process.env.NEXT_KAKAO_JS_CLIENT_ID}`
const KAKAO_REDIRECT_URI = `${process.env.NEXT_FRONT_URL}`

export const api = {
  fetchBusinessData: async (hash: string): Promise<BusinessDataItem[]> => {
    try {
      const response = await fetch(`${baseURL}/get_business_info?hash=${hash}`)
      return (await response.json()) as BusinessDataItem[]
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  },

  fetchSearchResult: async (
    businessName: string,
    location?: string,
    page?: number
  ): Promise<PaginatedResponse<SearchResultItem>> => {
    try {
      let url = `${baseURL}/search_business?business_name=${businessName}`
      if (location) url += `&location=${location}`
      if (page) url += `&page=${page}`

      const response = await fetch(url)
      return (await response.json()) as PaginatedResponse<SearchResultItem>
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  },

  fetchRankResult: async (ymonth: string, searchType: string): Promise<RankDataItem[]> => {
    try {
      const url = `${baseURL}/get_rank_info?ymonth=${ymonth}&type=${searchType}`
      const response = await fetch(url)
      return (await response.json()) as RankDataItem[]
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  },

  fetchReplyData: async (hash: string): Promise<ReplyItem[]> => {
    try {
      const response = await fetch(`${baseURL}/reply?hash=${hash}`)
      return (await response.json()) as ReplyItem[]
    } catch (error) {
      console.error('Error fetching reply data:', error)
      throw error
    }
  },

  fetchDartData: async (name: string): Promise<DartDocument[]> => {
    try {
      const response = await fetch(`${baseURL}/get_dart_info?name=${name}`)
      return (await response.json()) as DartDocument[]
    } catch (error) {
      console.error('Error fetching dart data:', error)
      throw error
    }
  },

  get: async <T = unknown>(url: string, config: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${baseURL}${url}`, {
      ...config,
      next: { revalidate: 3600 },
    })
    return (await response.json()) as T
  },

  post: async <T = unknown, D = unknown>(
    url: string,
    data: D = {} as D,
    config: AxiosRequestConfig = {}
  ): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config)
    return response.data
  },

  put: async <T = unknown, D = unknown>(
    url: string,
    data: D = {} as D,
    config: AxiosRequestConfig = {}
  ): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config)
    return response.data
  },

  delete: async <T = unknown>(url: string, config: AxiosRequestConfig = {}): Promise<T> => {
    const response = await apiClient.delete<T>(url, config)
    return response.data
  },

  patch: async <T = unknown, D = unknown>(
    url: string,
    data: D = {} as D,
    config: AxiosRequestConfig = {}
  ): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config)
    return response.data
  },
}

// 카카오 OAuth — Phase 2 에서 백엔드 콜백 모델로 전환 예정
export const authApi = {
  goKakaoLogin: (): void => {
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`
    window.location.href = kakaoAuthURL
  },

  getAccessToken: async (code: string): Promise<{ access_token?: string }> => {
    const response = await api.get<{ access_token?: string }>(`/oauth?code=${code}`)
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token)
    }
    return response
  },

  logout: (): void => {
    localStorage.removeItem('access_token')
  },
}

export default api
