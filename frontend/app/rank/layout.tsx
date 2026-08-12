import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '입퇴사자 순위 - COMPANY COLOR',
  description:
    '월별 입사자·퇴사자가 많은 기업 순위를 국민연금 데이터 기반으로 확인하세요.',
  alternates: {
    canonical: '/rank',
  },
  openGraph: {
    title: '입퇴사자 순위 - COMPANY COLOR',
    description:
      '월별 입사자·퇴사자가 많은 기업 순위를 국민연금 데이터 기반으로 확인하세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'COMPANY COLOR',
    url: '/rank',
    images: [{ url: '/link_img.png', width: 1200, height: 630 }],
  },
}

export default function RankLayout({ children }: { children: ReactNode }) {
  return children
}
