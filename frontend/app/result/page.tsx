import { Suspense } from 'react'
import { ClockLoader } from 'react-spinners'
import ResultView from './ResultView'
import SearchStructuredData from './SearchStructuredData'

export { generateMetadata } from './metadata'

interface ResultPageProps {
  searchParams: Promise<{ business_name?: string; location?: string; page?: string }>
}

/**
 * 검색 결과 페이지 (서버 컴포넌트 래퍼)
 * UI 는 ResultView(클라이언트)가 담당하고, 여기서는 metadata 와 구조화 데이터를 서버 렌더한다.
 */
export default async function Result({ searchParams }: ResultPageProps) {
  const { business_name: businessName, location } = await searchParams

  return (
    <>
      <SearchStructuredData businessName={businessName} location={location} />
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <ClockLoader color="#3182CE" />
          </div>
        }
      >
        <ResultView />
      </Suspense>
    </>
  )
}
