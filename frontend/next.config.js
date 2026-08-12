/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

// 번들 분석기 설정
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  reactStrictMode: false,
    output: 'standalone',
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'companycolor.site',
      },
      {
        protocol: 'https', 
        hostname: '*.companycolor.site',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1년
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // 보안 헤더 설정
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
            "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
            "img-src 'self' blob: data: https: https://www.google-analytics.com",
            isDev
                ? "connect-src 'self' http://localhost:* http://127.0.0.1:8001 ws: wss: https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com"
                : "connect-src 'self' https://companycolor.site https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests"
          ].join('; ')
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: [
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'gyroscope=()',
            'magnetometer=()',
            'payment=()',
            'usb=()',
          ].join(', ')
        },
        ...(isDev ? [] : [{
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains'
        }]),
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
      ],
    },
  ],
  
  // 기업 상세 URL(/businessInfo?hash= → /company/[hash]) 의 영구 리다이렉트는
  // app/businessInfo/page.tsx 에서 처리한다.
  // next.config.js 의 redirects 는 원본 쿼리스트링을 목적지에 그대로 덧붙여
  // /company/<hash>?hash=<hash> 같은 중복 URL 을 만들기 때문이다.
  // 압축 설정
  compress: true,

  // 정적 파일 최적화
  trailingSlash: false,
};

module.exports = withBundleAnalyzer(nextConfig);
