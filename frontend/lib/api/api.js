import apiClient from './axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL

const KAKAO_CLIENT_ID = `${process.env.NEXT_KAKAO_JS_CLIENT_ID}`
const KAKAO_REDIRECT_URI = `${process.env.NEXT_FRONT_URL}`

export const api = {
  // 일반적인 데이터 조회
  fetchBusinessData: async (hash) => {
    try {
      const response = await fetch(`${baseURL}/get_business_info?hash=${hash}`)
      return response.json()
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  },

  // 검색 결과 조회
  fetchSearchResult: async (businessName, location, page) => {
    try {
      let url = `${baseURL}/search_business?business_name=${businessName}`
      if (location) url += `&location=${location}`
      if (page) url += `&page=${page}`

      const response = await fetch(url)
      return response.json()
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  },

  // 검색 결과 조회
  fetchRankResult: async (ymonth, searchType) => {
    try {
      let url = `${baseURL}/get_rank_info?ymonth=${ymonth}&type=${searchType}`

      const response = await fetch(url)
      return response.json()
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  },

  fetchReplyData: async (hash) => {
    try {
      const response = await fetch(`${baseURL}/reply?hash=${hash}`)
      return response.json()
    } catch (error) {
      console.error('Error fetching reply data:', error)
      throw error
    }
  },

  fetchDartData: async (name) => {
    try {
      const response = await fetch(`${baseURL}/get_dart_info?name=${name}`)
      return response.json()
    } catch (error) {
      console.error('Error fetching dart data:', error)
      throw error
    }
  },

  get: async (url, config = {}) => {
    const response = await fetch(`${baseURL}${url}`, {
      ...config, next: {revalidate: 3600}
    })
    return response.json()
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