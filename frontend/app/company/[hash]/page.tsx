import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import BusinessDataView from './BusinessDataView'
import { summarizeCompany } from './summary'
import { fetchBusinessDataServer } from '@/lib/api/server'
import { SITE_URL } from '@/constants/site'

/** BusinessDataView 의 초기 선택값과 동일해야 hydration 이 맞물린다. */
const DEFAULT_PERIOD = 12

interface CompanyPageProps {
  params: Promise<{ hash: string }>
}

/**
 * 서버 fetch 는 Next 가 요청 단위로 중복 제거하므로
 * generateMetadata 와 페이지 렌더가 각각 호출해도 실제 요청은 1회다.
 */
async function loadCompany(hash: string) {
  try {
    return await fetchBusinessDataServer(hash, DEFAULT_PERIOD)
  } catch (error) {
    console.error('기업 데이터 조회 실패:', error)
    return null
  }
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { hash } = await params
  const canonical = `/company/${encodeURIComponent(hash)}`

  const data = await loadCompany(hash)
  const summary = data && summarizeCompany(data)

  if (!summary) {
    return {
      title: '회사 정보 - COMPANY COLOR',
      description: '회사의 인원 규모, 입퇴사 현황, 예상 평균 연봉을 확인하세요.',
      robots: { index: false, follow: true },
    }
  }

  const { latest, quitRate } = summary
  const title = `${latest.company_nm} 기업 분석 - COMPANY COLOR`
  const description = `${latest.company_nm}의 인원 규모(${latest.subscriber_cnt}명), 입퇴사 현황, 퇴사율(${quitRate.toFixed(1)}%), 추정 평균 연봉 정보를 확인하세요.`

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

/**
 * 기업 상세 페이지.
 *
 * 서버에서 조회한 데이터를 react-query 캐시에 dehydrate 해 넘기므로
 * 초기 HTML 에 회사명·인원수·퇴사율이 담기고, 클라이언트는 같은 데이터를 다시 받지 않는다.
 */
export default async function CompanyPage({ params }: CompanyPageProps) {
  const { hash } = await params

  const data = await loadCompany(hash)
  const summary = data && summarizeCompany(data)

  if (!summary) {
    notFound()
  }

  const queryClient = new QueryClient()
  queryClient.setQueryData(['business', hash, DEFAULT_PERIOD], data)

  const { latest } = summary
  const pageUrl = `${SITE_URL}/company/${encodeURIComponent(hash)}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: latest.company_nm,
        url: pageUrl,
        numberOfEmployees: {
          '@type': 'QuantitativeValue',
          value: latest.subscriber_cnt,
          unitText: '국민연금 가입자 수',
        },
        ...(latest.business_location
          ? {
              address: {
                '@type': 'PostalAddress',
                addressRegion: latest.business_location,
                addressCountry: 'KR',
              },
            }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: latest.company_nm, item: pageUrl },
        ],
      },
    ],
  }

  return (
    <>
      {/* next/script 가 아닌 순수 script 태그여야 초기 SSR HTML 에 포함된다 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BusinessDataView hash={hash} />
      </HydrationBoundary>
    </>
  )
}
