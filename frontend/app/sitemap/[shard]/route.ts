import { notFound } from 'next/navigation'
import { STATIC_URLS, collectShardUrls, renderUrlSet } from '@/lib/sitemap'

export const revalidate = 86400

const COMPANY_SHARD_PATTERN = /^companies-(\d+)\.xml$/

interface RouteContext {
  params: Promise<{ shard: string }>
}

/**
 * sitemap 샤드.
 * - `/sitemap/static.xml`        → 고정 페이지
 * - `/sitemap/companies-N.xml`   → 기업 상세 URL (N 번째 id 구간)
 */
export async function GET(_request: Request, { params }: RouteContext) {
  const { shard } = await params

  if (shard === 'static.xml') {
    return xmlResponse(renderUrlSet(STATIC_URLS))
  }

  const match = COMPANY_SHARD_PATTERN.exec(shard)
  if (!match) {
    notFound()
  }

  const urls = await collectShardUrls(Number.parseInt(match[1], 10))
  if (urls.length === 0) {
    notFound()
  }

  return xmlResponse(renderUrlSet(urls))
}

function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
