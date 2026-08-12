import { SITE_URL } from '@/constants/site'
import { fetchSitemapCompanies, fetchSitemapSummary } from '@/lib/api/server'

/**
 * 샤드 하나가 담당하는 COMPANY_INFO id 폭.
 * sitemap 규격상 파일당 URL 상한이 50,000 이므로 여유를 두고 40,000 으로 잡는다.
 * (id 는 연속적이지 않을 수 있어 실제 URL 수는 이보다 적다)
 */
export const SHARD_ID_SPAN = 40000

/** 백엔드 한 번 호출로 가져올 항목 수 (백엔드 상한 5000) */
const PAGE_SIZE = 5000

/** 샤드 하나를 만들 때 허용할 최대 백엔드 호출 수 — 무한 루프 방지용 안전장치 */
const MAX_PAGES_PER_SHARD = Math.ceil(SHARD_ID_SPAN / PAGE_SIZE) + 1

export interface SitemapUrl {
  loc: string
  changefreq?: string
  priority?: string
  lastmod?: string
}

/** 검색으로 도달하는 고정 페이지들 */
export const STATIC_URLS: SitemapUrl[] = [
  { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' },
  { loc: `${SITE_URL}/rank`, changefreq: 'daily', priority: '0.9' },
  { loc: `${SITE_URL}/result`, changefreq: 'weekly', priority: '0.6' },
  { loc: `${SITE_URL}/siteInfo`, changefreq: 'monthly', priority: '0.5' },
]

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function renderUrlSet(urls: SitemapUrl[]): string {
  const body = urls
    .map((url) => {
      const parts = [`    <loc>${escapeXml(url.loc)}</loc>`]
      if (url.lastmod) parts.push(`    <lastmod>${url.lastmod}</lastmod>`)
      if (url.changefreq) parts.push(`    <changefreq>${url.changefreq}</changefreq>`)
      if (url.priority) parts.push(`    <priority>${url.priority}</priority>`)
      return `  <url>\n${parts.join('\n')}\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`
}

export function renderSitemapIndex(locs: string[]): string {
  const body = locs
    .map((loc) => `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n  </sitemap>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`
}

/** 전체 회사 수에 맞춰 필요한 샤드 개수를 계산한다 (최소 1개) */
export async function getCompanyShardCount(): Promise<number> {
  const summary = await fetchSitemapSummary()
  if (!summary.max_id) return 1
  return Math.max(1, Math.ceil(summary.max_id / SHARD_ID_SPAN))
}

/**
 * 샤드 하나가 담당하는 id 구간을 커서 페이징으로 전부 수집한다.
 * shardIndex 는 0-based 이며 id 구간은 (start, end] 이다.
 */
export async function collectShardUrls(shardIndex: number): Promise<SitemapUrl[]> {
  const start = shardIndex * SHARD_ID_SPAN
  const end = start + SHARD_ID_SPAN

  const urls: SitemapUrl[] = []
  let cursor = start

  for (let page = 0; page < MAX_PAGES_PER_SHARD; page += 1) {
    const response = await fetchSitemapCompanies({
      afterId: cursor,
      maxId: end,
      limit: PAGE_SIZE,
    })

    for (const item of response.items) {
      urls.push({
        loc: `${SITE_URL}/company/${encodeURIComponent(item.hash)}`,
        changefreq: 'monthly',
        priority: '0.7',
      })
    }

    if (response.next_cursor === null) break
    cursor = response.next_cursor
  }

  return urls
}
