'use client'

import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

// 검색 결과 페이지에 구조화된 데이터를 추가하는 컴포넌트
export default function SearchStructuredData() {
  const searchParams = useSearchParams();
  const businessName = searchParams.get('business_name') || '';
  
  // 구조화된 데이터 생성
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${businessName} 검색 결과`,
    description: `${businessName} 기업의 인원 규모, 입퇴사 현황, 예상 평균 연봉 정보를 확인하세요.`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Organization',
            name: `${businessName}`,
            description: `${businessName} 기업의 인원 규모, 입퇴사 현황, 예상 평균 연봉 정보`,
            url: `https://companycolor.xyz/result?business_name=${encodeURIComponent(businessName)}`
          }
        }
      ]
    }
  };

  return (
    <Script 
      id="search-structured-data" 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
