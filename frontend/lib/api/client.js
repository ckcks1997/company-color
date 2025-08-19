'use client'

/**
 * 클라이언트 컴포넌트에서 사용할 API 클라이언트
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 에러 처리 로직
    return Promise.reject(error);
  }
);

/**
 * 댓글 등록
 */
export async function postReply(hash, value) {
  try {
    const response = await apiClient.post('/reply', {
      hash,
      value
    });
    return response.data;
  } catch (error) {
    console.error('Error posting reply:', error);
    throw error;
  }
}

/**
 * 클라이언트 측에서의 비즈니스 데이터 조회 (SWR/React Query와 함께 사용)
 */
export async function fetchBusinessData(hash, period=12) {
  try {
    const periodParam = period === 24 ? '2y' : period;
    const response = await fetch(`${API_BASE_URL}/get_business_info?hash=${hash}&period=${periodParam}`);
    if (!response.ok) {
      throw new Error('Failed to fetch business data');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching business data:', error);
    throw error;
  }
}

/**
 * 클라이언트 측에서의 검색 결과 조회
 */
export async function fetchSearchResults(businessName, location, page) {
  try {
    let url = `${API_BASE_URL}/search_business?business_name=${encodeURIComponent(businessName)}`;
    
    if (location) {
      url += `&location=${encodeURIComponent(location)}`;
    }
    
    if (page) {
      url += `&page=${page}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
}

/**
 * 클라이언트 측에서의 순위 데이터 조회
 */
export async function fetchRankData(ymonth, searchType) {
  try {
    const url = `${API_BASE_URL}/get_rank_info?ymonth=${ymonth}&type=${searchType}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch rank data');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching rank data:', error);
    throw error;
  }
}
