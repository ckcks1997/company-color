import apiClient from './axios';
import useLoadingStore from "../store/loadingStore.js";

const KAKAO_CLIENT_ID = `${import.meta.env.VITE_KAKAO_JS_CLIENT_ID}`
const KAKAO_REDIRECT_URI = `${import.meta.env.VITE_FRONT_URL}`

export const api = {
  get: async (url, config = {}) => {
    const response = await apiClient.get(url, config);
    return response.data;
  },

  post: async (url, data = {}, config = {}) => {
    const response = await apiClient.post(url, data, config);
    return response.data;
  },

  put: async (url, data = {}, config = {}) => {
    const response = await apiClient.put(url, data, config);
    return response.data;
  },

  delete: async (url, config = {}) => {
    const response = await apiClient.delete(url, config);
    return response.data;
  },

  patch: async (url, data = {}, config = {}) => {
    const response = await apiClient.patch(url, data, config);
    return response.data;
  }
};

// Auth 관련 API
export const authApi = {
  // 카카오 로그인 URL 가져오기
  goKakaoLogin: () => {

    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoAuthURL;
  },

  // 카카오 콜백후 토큰
  getAccessToken: async (code) => {
    const response = await api.get(`/oauth?code=${code}`);
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
    }
    return response;
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('access_token');
  }
};

export default api;