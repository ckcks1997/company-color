import type { Metadata } from 'next'

interface GenerateMetadataProps {
  searchParams: Promise<{ business_name?: string; location?: string; page?: string }>
}

/**
 * 검색 조건을 그대로 반영한 canonical 경로를 만든다.
 * (page=1은 기본값이므로 canonical에서 제외해 중복 URL을 줄인다)
 */
function buildCanonical({
  businessName,
  location,
  page,
}: {
  businessName?: string
  location?: string
  page?: string
}): string {
  const params = new URLSearchParams()
  if (businessName) params.set('business_name', businessName)
  if (location) params.set('location', location)

  const pageNumber = Number.parseInt(page || '1', 10)
  if (Number.isFinite(pageNumber) && pageNumber > 1) {
    params.set('page', String(pageNumber))
  }

  const query = params.toString()
  return query ? `/result?${query}` : '/result'
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

  const canonical = buildCanonical({
    businessName,
    location,
    page: resolved.page,
  })

  if (!businessName) {
    return {
      title: '회사 검색 결과 - COMPANY COLOR',
      description: '국민연금 가입 회사 정보를 검색하고 입퇴사율을 확인하세요.',
      alternates: { canonical },
      openGraph: {
        title: '회사 검색 결과 - COMPANY COLOR',
        description: '국민연금 가입 회사 정보를 검색하고 입퇴사율을 확인하세요.',
        type: 'website',
        locale: 'ko_KR',
        siteName: 'COMPANY COLOR',
        url: canonical,
        images: [{ url: '/link_img.png', width: 1200, height: 630 }],
      },
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
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ko_KR',
      siteName: 'COMPANY COLOR',
      url: canonical,
      images: [{ url: '/link_img.png', width: 1200, height: 630 }],
    },
  }
}
