'use client';

import { useEffect } from 'react';
import Script from 'next/script';

// AdSense 스크립트 로드 및 초기화 관리를 위한 클라이언트 컴포넌트
export default function AdsenseLoader() {
  useEffect(() => {
    // 컴포넌트 마운트 시 window 객체 존재 여부 확인
    if (typeof window !== 'undefined') {
      window.adsenseInitialized = false;
    }
  }, []);

  const handleAdsenseLoad = () => {
    // 스크립트 로드 완료 시 초기화 상태 설정
    if (typeof window !== 'undefined') {
      window.adsenseInitialized = true;
      console.log('AdSense 스크립트 로드 완료');
    }
  };

  return (
    <Script
      id="google-adsense-loader"
      onLoad={handleAdsenseLoad}
      strategy="afterInteractive"
    />
  );
}
