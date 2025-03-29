import {Providers} from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {Suspense} from 'react';
import {ClockLoader} from "react-spinners";
import './globals.css'
import Script from 'next/script';
import AdsenseLoader from '@/components/AdsenseLoader';

export const metadata = {
  title: 'COMPANY COLOR',
  description: '기업의 현재 인원 규모, 최근 입사자 및 퇴사자 동향, 예상 평균 연봉 데이터까지! 구직에 필요한 회사 정보를 만나보세요.',
  keywords: '연봉, 연봉정보, 기업정보, 퇴사율, 기업퇴사율, 블랙기업, 화이트기업, 입퇴사자현황',
  robots: 'index, follow',
  canonical: 'https://companycolor.site',
  alternates: {
    canonical: 'https://companycolor.site',
  },
  openGraph: {
    title: 'COMPANY COLOR - 구직에 필요한 기업정보 조회 사이트',
    description: '기업의 현재 인원 규모, 최근 입사자 및 퇴사자 동향, 예상 평균 연봉 데이터까지! 구직에 필요한 회사 정보를 만나보세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'COMPANY COLOR',
    url: 'https://companycolor.site',
    images: [{
      url: 'https://companycolor.site/link_img.png',
      width: 1200,
      height: 630,
      alt: 'COMPANY COLOR 로고',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COMPANY COLOR - 구직에 필요한 기업정보 조회 사이트',
    description: '기업의 현재 인원 규모, 최근 입사자 및 퇴사자 동향, 예상 평균 연봉 데이터까지! 구직에 필요한 회사 정보를 만나보세요.',
    images: ['https://companycolor.site/link_img.png'],
  },
  icons: {
    icon: [
      {url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png'},
      {url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png'},
      {url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png'},
    ],
    apple: [
      {url: '/apple-touch-icon.png'},
    ],
  },
  verification: {
    google: 'G-YDV11GRYRB'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  themeColor: '#3182CE',
}

export default function RootLayout({children}) {
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
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2021212784953265"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script id="structured-data" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "COMPANY COLOR",
              "url": "https://companycolor.site",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://companycolor.site/result?business_name={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "description": "기업의 현재 인원 규모, 최근 입사자 및 퇴사자 동향, 예상 평균 연봉 데이터까지! 구직에 필요한 회사 정보를 만나보세요."
            }
          `}
        </Script>
      </head>
      <body>
        <Providers>
          <header>
            <Navbar/>
          </header>
          <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><ClockLoader color="#3182CE"/></div>}>
            <main>{children}</main>
          </Suspense>
          <Footer/>
          <AdsenseLoader />
        </Providers>
      </body>
    </html>
  )
}