/**
 * 검색 결과 페이지의 동적 메타데이터 생성
 * @param {Object} params - 요청 파라미터
 * @param {Object} params.searchParams - URL 검색 파라미터
 * @returns {Object} 메타데이터 객체
 */
export function generateMetadata({ searchParams }) {
  const businessName = searchParams.business_name
  const location = searchParams.location
  
  // 검색어가 없는 경우 기본 메타데이터 반환
  if (!businessName) {
    return {
      title: '회사 검색 결과 - COMPANY COLOR',
      description: '국민연금 가입 회사 정보를 검색하고 입퇴사율을 확인하세요.',
    }
  }
  
  // 지역 정보를 포함한 제목 구성
  const title = location 
    ? `${businessName} ${location} 검색 결과 - COMPANY COLOR` 
    : `${businessName} 검색 결과 - COMPANY COLOR`
  
  // 지역 정보를 포함한 설명 구성
  const description = location
    ? `${businessName} ${location} 기업의 인원 규모, 입퇴사 현황, 예상 평균 연봉 정보를 확인하세요.`
    : `${businessName} 기업의 인원 규모, 입퇴사 현황, 예상 평균 연봉 정보를 확인하세요.`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}
