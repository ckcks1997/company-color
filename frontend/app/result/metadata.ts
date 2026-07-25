import type { Metadata } from 'next'

interface GenerateMetadataProps {
  searchParams: Promise<{ business_name?: string; location?: string; page?: string }>
}

/**
 * 검색 결과 페이지의 동적 메타데이터 생성
 */
export async function generateMetadata({
  searchParams,
}: GenerateMetadataProps): Promise<Metadata> {
  const resolved = await searchParams
  const businessName = resolved.business_name
  const location = resolved.location

  if (!businessName) {
    return {
      title: '회사 검색 결과 - COMPANY COLOR',
      description: '국민연금 가입 회사 정보를 검색하고 입퇴사율을 확인하세요.',
    }
  }

  const title = location
    ? `${businessName} ${location} 검색 결과 - COMPANY COLOR`
    : `${businessName} 검색 결과 - COMPANY COLOR`

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
