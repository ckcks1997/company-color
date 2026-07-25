import type { Metadata } from 'next'
import type { BusinessDataItem } from '@/lib/api/types'

interface GenerateMetadataProps {
  searchParams: Promise<{ hash?: string }>
}

/**
 * 회사 정보 페이지의 동적 메타데이터 생성
 */
export async function generateMetadata({
  searchParams,
}: GenerateMetadataProps): Promise<Metadata> {
  const resolved = await searchParams
  const hash = resolved.hash

  if (!hash) {
    return {
      title: '회사 정보 - COMPANY COLOR',
      description: '회사의 인원 규모, 입퇴사 현황, 예상 평균 연봉을 확인하세요.',
    }
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/get_business_info?hash=${hash}`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch business data')
    }

    const data = (await response.json()) as BusinessDataItem[]

    if (data && data.length > 0) {
      const sortedData = [...data].sort(
        (a, b) =>
          new Date(b.created_dt || 0).getTime() - new Date(a.created_dt || 0).getTime()
      )
      const latestData = sortedData[0]

      const totalQuit = data.reduce((sum, item) => sum + (item.subscriber_quit || 0), 0)
      const quitRate = latestData.subscriber_cnt
        ? (totalQuit / latestData.subscriber_cnt) * 100
        : 0
      const quitRateFormatted = quitRate.toFixed(1)

      return {
        title: `${latestData.company_nm} 기업 분석 - COMPANY COLOR`,
        description: `${latestData.company_nm}의 인원 규모(${latestData.subscriber_cnt}명), 입퇴사 현황, 퇴사율(${quitRateFormatted}%), 추정 평균 연봉 정보를 확인하세요.`,
        openGraph: {
          title: `${latestData.company_nm} 기업 분석 - COMPANY COLOR`,
          description: `${latestData.company_nm}의 인원 규모(${latestData.subscriber_cnt}명), 입퇴사 현황, 퇴사율(${quitRateFormatted}%), 추정 평균 연봉 정보를 확인하세요.`,
          type: 'website',
        },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return {
    title: '회사 정보 - COMPANY COLOR',
    description: '회사의 인원 규모, 입퇴사 현황, 예상 평균 연봉을 확인하세요.',
  }
}
