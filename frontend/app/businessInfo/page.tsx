import { permanentRedirect } from 'next/navigation'

interface LegacyBusinessInfoProps {
  searchParams: Promise<{ hash?: string }>
}

/**
 * 구 기업 상세 URL 의 영구 리다이렉트 전용 라우트.
 *
 * `/businessInfo?hash=<hash>` → `/company/<hash>`
 * hash 가 없던 URL(예전 sitemap 이 광고하던 빈 페이지)은 홈으로 보낸다.
 */
export default async function LegacyBusinessInfo({
  searchParams,
}: LegacyBusinessInfoProps) {
  const { hash } = await searchParams
  permanentRedirect(hash ? `/company/${encodeURIComponent(hash)}` : '/')
}
