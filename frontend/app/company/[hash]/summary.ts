import type { BusinessDataItem } from '@/lib/api/types'

export interface CompanySummary {
  /** created_dt 기준 가장 최근 스냅샷 */
  latest: BusinessDataItem
  /** 조회 기간 내 총 입사자 수 */
  totalNew: number
  /** 조회 기간 내 총 퇴사자 수 */
  totalQuit: number
  /** 총 퇴사자 / 현재 인원 (%) */
  quitRate: number
}

/**
 * 메타데이터와 구조화 데이터에서 함께 쓰는 요약값.
 * 화면 계산(BusinessDataView)과 동일한 정의를 사용해 표시값이 어긋나지 않게 한다.
 */
export function summarizeCompany(data: BusinessDataItem[]): CompanySummary | null {
  if (!Array.isArray(data) || data.length === 0) return null

  const sorted = [...data].sort(
    (a, b) => new Date(b.created_dt || 0).getTime() - new Date(a.created_dt || 0).getTime()
  )
  const latest = sorted[0]

  const totalNew = data.reduce((sum, item) => sum + (item.subscriber_new || 0), 0)
  const totalQuit = data.reduce((sum, item) => sum + (item.subscriber_quit || 0), 0)
  const quitRate = latest.subscriber_cnt ? (totalQuit / latest.subscriber_cnt) * 100 : 0

  return { latest, totalNew, totalQuit, quitRate }
}
