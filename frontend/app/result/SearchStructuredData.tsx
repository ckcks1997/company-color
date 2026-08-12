import { SITE_URL } from '@/constants/site'

interface SearchStructuredDataProps {
  businessName?: string
  location?: string
}

/**
 * 검색 결과 페이지의 구조화 데이터 (서버 컴포넌트).
 *
 * 실제 결과 목록은 클라이언트에서 조회하므로 여기서는 "무엇을 검색한 페이지인지"만 기술한다.
 * 확인되지 않은 Organization 항목을 지어내면 구조화 데이터 정책 위반이 되므로 넣지 않는다.
 */
export default function SearchStructuredData({
  businessName,
  location,
}: SearchStructuredDataProps) {
  if (!businessName) return null

  const params = new URLSearchParams({ business_name: businessName })
  if (location) params.set('location', location)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: location
      ? `${businessName} ${location} 검색 결과`
      : `${businessName} 검색 결과`,
    description: `${businessName} 기업의 인원 규모, 입퇴사 현황, 예상 평균 연봉 정보를 확인하세요.`,
    url: `${SITE_URL}/result?${params.toString()}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'COMPANY COLOR',
      url: SITE_URL,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
