import { SITE_URL } from '@/constants/site'
import { getCompanyShardCount, renderSitemapIndex } from '@/lib/sitemap'

/**
 * 빌드 시점에는 백엔드가 아직 새 엔드포인트를 제공하지 않을 수 있다.
 * 그때 만들어진 축소본이 캐시에 굳지 않도록 요청 시마다 생성한다.
 * (조회는 COMPANY_INFO PK 만 훑는 MIN/MAX/COUNT 한 번뿐이다)
 */
export const dynamic = 'force-dynamic'

/**
 * sitemap 색인 파일.
 * 고정 페이지 sitemap 1개 + 기업 상세 샤드 N개를 나열한다.
 */
export async function GET() {
  const locs = [`${SITE_URL}/sitemap/static.xml`]

  try {
    const shardCount = await getCompanyShardCount()
    for (let i = 0; i < shardCount; i += 1) {
      locs.push(`${SITE_URL}/sitemap/companies-${i}.xml`)
    }
  } catch (error) {
    // 백엔드 장애 시에도 고정 페이지 sitemap 은 계속 제공한다.
    console.error('sitemap 색인 생성 실패:', error)
  }

  return new Response(renderSitemapIndex(locs), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
