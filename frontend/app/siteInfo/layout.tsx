import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '사이트 정보 - COMPANY COLOR',
  description:
    'COMPANY COLOR가 제공하는 데이터의 출처와 산출 방식, 개인정보 처리방침을 안내합니다.',
  alternates: {
    canonical: '/siteInfo',
  },
  openGraph: {
    title: '사이트 정보 - COMPANY COLOR',
    description:
      'COMPANY COLOR가 제공하는 데이터의 출처와 산출 방식, 개인정보 처리방침을 안내합니다.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'COMPANY COLOR',
    url: '/siteInfo',
    images: [{ url: '/link_img.png', width: 1200, height: 630 }],
  },
}

export default function SiteInfoLayout({ children }: { children: ReactNode }) {
  return children
}
