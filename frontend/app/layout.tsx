import { Providers } from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AuroraBackground from '@/components/AuroraBackground'
import type { ReactNode } from 'react'
import './globals.css'
import Script from 'next/script'
import type { Metadata, Viewport } from 'next'
import { SITE_URL } from '@/constants/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'COMPANY COLOR',
  description:
    '기업의 현재 인원 규모, 최근 입사자 및 퇴사자 동향, 예상 평균 연봉 데이터까지! 구직에 필요한 회사 정보를 만나보세요.',
  keywords: '연봉, 연봉정보, 기업정보, 퇴사율, 기업퇴사율, 블랙기업, 화이트기업, 입퇴사자현황',
  robots: 'index, follow',
  openGraph: {
    title: 'COMPANY COLOR - 구직에 필요한 기업정보 조회 사이트',
    description:
      '기업의 현재 인원 규모, 최근 입사자 및 퇴사자 동향, 예상 평균 연봉 데이터까지! 구직에 필요한 회사 정보를 만나보세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'COMPANY COLOR',
    url: '/',
    images: [
      {
        url: '/link_img.png',
        width: 1200,
        height: 630,
        alt: 'COMPANY COLOR 로고',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COMPANY COLOR - 구직에 필요한 기업정보 조회 사이트',
    description:
      '기업의 현재 인원 규모, 최근 입사자 및 퇴사자 동향, 예상 평균 연봉 데이터까지! 구직에 필요한 회사 정보를 만나보세요.',
    images: ['/link_img.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  verification: {
    google: 'G-YDV11GRYRB',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  themeColor: '#3182CE',
}

const WEBSITE_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'COMPANY COLOR',
  url: SITE_URL,
  description:
    '기업의 현재 인원 규모, 최근 입사자 및 퇴사자 동향, 예상 평균 연봉 데이터까지! 구직에 필요한 회사 정보를 만나보세요.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/result?business_name={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
        <link rel="manifest" href="/manifest.json" />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-YDV11GRYRB`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YDV11GRYRB');
          `}
        </Script>
        {/* next/script 는 afterInteractive 라 초기 HTML 에 들어가지 않는다.
            구조화 데이터는 크롤러가 첫 응답에서 읽어야 하므로 순수 script 태그로 서버 렌더한다. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_STRUCTURED_DATA) }}
        />
        <meta
          name="naver-site-verification"
          content="64e45423b47966980449eb5d8c459ed5fc549f7f"
        />
      </head>
      <body>
        <Providers>
          <AuroraBackground />
          <header style={{ position: 'relative', zIndex: 10 }}>
            <Navbar />
          </header>
          {/* 여기에 Suspense 를 두면 페이지가 notFound() 를 던지기 전에 셸이 200 으로
              먼저 스트리밍되어 soft-404 가 된다. 로딩 표시는 각 라우트가 담당한다. */}
          <main style={{ position: 'relative', zIndex: 1 }}>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
