import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ClockLoader } from 'react-spinners'
import BusinessDataView from './BusinessDataView'

interface BusinessInfoProps {
  searchParams: Promise<{ hash?: string }>
}

/**
 * 회사 정보 페이지 (서버 컴포넌트)
 */
export default async function BusinessInfo({ searchParams }: BusinessInfoProps) {
  const params = await searchParams
  const hash = params.hash

  if (!hash) {
    notFound()
  }

  // 서버에서 데이터 가져오기 시도 (유효성 검증)
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/get_business_info?hash=${hash}`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch business data')
    }

    await response.json()
  } catch (error) {
    console.error('Error loading business data:', error)
    notFound()
  }

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <ClockLoader color="#3182CE" />
        </div>
      }
    >
      <BusinessDataView hash={hash} />
    </Suspense>
  )
}
