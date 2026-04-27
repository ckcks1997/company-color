import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'

const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  // httpOnly 쿠키 송수신 — 백엔드의 access_token / refresh_token 쿠키를 자동 전달.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// 동시 401 폭주 시 refresh 가 한 번만 일어나도록 큐잉
let refreshPromise: Promise<void> | null = null

const refreshSession = async (): Promise<void> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status

    // refresh 요청 자체가 401 이면 더 이상 재시도하지 않음
    const isRefreshCall = original?.url?.includes('/auth/refresh')

    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true
      try {
        await refreshSession()
        return apiClient.request(original)
      } catch {
        // refresh 실패 — 그대로 401 을 반환해 호출자가 로그인 유도 처리
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
