'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Google AdSense 광고 컴포넌트
export default function GoogleAd({ slot, format, responsive = true, style = {} }) {
  const adRef = useRef(null);
  const [adInitialized, setAdInitialized] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 광고 초기화 함수
  const initializeAd = () => {
    if (!adRef.current || adInitialized) return;
    
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        // AdSense 광고 삽입
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdInitialized(true);
        console.log(`Ad slot ${slot} initialized`);
      }
    } catch (error) {
      console.error('AdSense 광고 로딩 오류:', error);
    }
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // 약간의 지연 후 광고 초기화 (스크립트 로드 시간 고려)
    const timer = setTimeout(() => {
      initializeAd();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // URL 변경 시 재초기화
  useEffect(() => {
    // 이미 초기화된 경우
    if (adInitialized && adRef.current) {
      // 상태 초기화
      setAdInitialized(false);
      
      // 다음 렌더링 사이클에서 다시 초기화
      const timer = setTimeout(() => {
        initializeAd();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, adInitialized]);

  // 반응형 광고인 경우
  if (responsive) {
    return (
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-2021212784953265"
        data-ad-slot={slot}
        data-ad-format={format || 'auto'}
        data-full-width-responsive="true"
      />
    );
  }

  // 고정 크기 광고인 경우
  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: 'inline-block', ...style }}
      data-ad-client="ca-pub-2021212784953265"
      data-ad-slot={slot}
    />
  );
}
