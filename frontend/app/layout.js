import {Providers} from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {Suspense} from 'react';
import {ClockLoader} from "react-spinners";
import './globals.css'

export const metadata = {
  title: 'COMPANY COLOR',
  description: '기업의 현재 인원 규모, 최근 입사자 및 퇴사자 동향, 예상 평균 연봉 데이터까지! 구직에 필요한 회사 정보를 만나보세요.',
  keywords: '연봉, 연봉정보, 기업정보, 퇴사율, 기업퇴사율, 블랙기업, 화이트기업, 입퇴사자현황',
  openGraph: {
    title: 'COMPANY COLOR - 구직에 필요한 기업정보 조회 사이트',
    description: '기업의 현재 인원 규모, 최근 입사자 및 퇴사자 동향, 예상 평균 연봉 데이터까지! 구직에 필요한 회사 정보를 만나보세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'COMPANY COLOR',
    images: [{
      url: 'https://companycolor.site/link_img.png',
    }],
  },
  icons: {
    icon: [
      {url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png'},
      {url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png'},
      {url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png'},
    ],
    apple: [
      {url: '/icon.png'},
    ],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
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
      </head>
      <body>
      <Providers>
        <Navbar/>
        <Suspense fallback={<ClockLoader color="#3182CE"/>}>
          <main>{children}</main>
        </Suspense>
        <Footer/>
      </Providers>
      </body>
      </html>
  )
}