'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Center,
  Divider,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import EmployeeChart from './EmployeeChart'
import BounceText from './BounceText'
import BusinessStats from './BusinessStats'
import DartData from './DartData'
import FavoriteToggle from '@/components/FavoriteToggle'
import PeriodSwitch from '@/components/PeriodSwitch'
import { useBusinessData } from '@/lib/hooks/useBusinessData'
import { useDartData } from '@/lib/hooks/useDartData'
import type { BusinessDataItem } from '@/lib/api/types'

interface BusinessDataViewProps {
  hash: string
}

const PERIOD_OPTIONS = [
  { value: 12, label: '1년' },
  { value: 24, label: '2년' },
  { value: 36, label: '3년' },
] as const

const calculatePercentChange = (
  current: number | null | undefined,
  previous: number | null | undefined
): number => {
  const c = current || 0
  const p = previous || 0

  if (p === 0) {
    if (c === 0) return 0
    return 100
  }
  if (c === 0) return -100
  return ((c - p) / p) * 100
}

const getBgColor = (rate: number, totalSubscriber: number | null | undefined): string => {
  if (!totalSubscriber || totalSubscriber < 20) return 'gray.50'
  if (rate < 15) return 'blue.100'
  if (rate < 20) return 'green.100'
  if (rate < 30) return 'orange.100'
  if (rate < 50) return 'red.200'
  if (rate < 70) return 'red.300'
  if (rate < 100) return 'red.400'
  return '#111'
}

const getBgGradientColor = (
  rate: number,
  totalSubscriber: number | null | undefined
): string => {
  if (totalSubscriber && totalSubscriber > 50 && rate < 10) {
    return 'linear(to-t, #FFD1DC, #FFE5B4, #E1FFB1, #B1FFFD, #CAB1FF)'
  }
  return ''
}

export default function BusinessDataView({ hash }: BusinessDataViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(12)
  const {
    data: businessData,
    isLoading,
    isFetching,
    isPlaceholderData,
    error,
  } = useBusinessData(hash, selectedPeriod)

  // 정렬된 데이터와 최신 행은 businessData 에서 직접 derive
  const sortedData = useMemo<BusinessDataItem[]>(() => {
    if (!businessData || !Array.isArray(businessData) || businessData.length === 0) return []
    return [...businessData].sort(
      (a, b) =>
        new Date(b.created_dt || 0).getTime() - new Date(a.created_dt || 0).getTime()
    )
  }, [businessData])

  const latestBusinessData = useMemo<Partial<BusinessDataItem>>(
    () => sortedData[0] ?? {},
    [sortedData]
  )

  // DART 데이터는 회사명을 키로 React Query 가 캐싱
  const { data: dartData = [], isLoading: isDartLoading } = useDartData(
    latestBusinessData?.company_nm
  )

  // 새 회사로 진입했을 때 페이지 상단으로 스크롤 (외부 시스템 동기화)
  useEffect(() => {
    if (latestBusinessData?.hash) {
      window.scrollTo(0, 0)
    }
  }, [latestBusinessData?.hash])

  const totalNew = useMemo(
    () => sortedData.reduce((sum, item) => sum + (item.subscriber_new || 0), 0),
    [sortedData]
  )

  const totalQuit = useMemo(
    () => sortedData.reduce((sum, item) => sum + (item.subscriber_quit || 0), 0),
    [sortedData]
  )

  const prevMonthNew = sortedData[1]?.subscriber_new || 0
  const prevMonthQuit = sortedData[1]?.subscriber_quit || 0

  const newPercentChange = useMemo(
    () => calculatePercentChange(latestBusinessData?.subscriber_new, prevMonthNew),
    [latestBusinessData, prevMonthNew]
  )

  const quitPercentChange = useMemo(
    () => calculatePercentChange(latestBusinessData?.subscriber_quit, prevMonthQuit),
    [latestBusinessData, prevMonthQuit]
  )

  // 퇴사율(연간 환산) — 렌더 중 계산
  const annualQuitRateRaw = useMemo(() => {
    const subscriberCnt = latestBusinessData?.subscriber_cnt
    if (!subscriberCnt || !totalQuit) return 0
    let rate = (totalQuit / subscriberCnt) * 100
    if (selectedPeriod === 24) rate = rate / 2
    else if (selectedPeriod === 36) rate = rate / 3
    return rate
  }, [latestBusinessData, totalQuit, selectedPeriod])

  const quitRate = useMemo(() => Number(annualQuitRateRaw.toFixed(2)) || 0, [annualQuitRateRaw])

  const bgColor = useMemo(
    () => getBgColor(annualQuitRateRaw, latestBusinessData?.subscriber_cnt),
    [annualQuitRateRaw, latestBusinessData]
  )

  const bgGradientColor = getBgGradientColor(quitRate, latestBusinessData?.subscriber_cnt)

  if (isLoading) {
    return (
      <Center minHeight="calc(100vh - 62px)">
        <Spinner color="#3182CE" size="xl" thickness="4px" />
      </Center>
    )
  }

  if (error) {
    return (
      <Center minHeight="calc(100vh - 62px)">
        <Text color="red.500">데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.</Text>
      </Center>
    )
  }

  if (!businessData || !Array.isArray(businessData) || businessData.length === 0) {
    return (
      <Center minHeight="calc(100vh - 62px)">
        <Text>회사 정보를 찾을 수 없습니다.</Text>
      </Center>
    )
  }

  return (
    <Box
      bg={bgColor}
      bgGradient={bgGradientColor}
      minHeight="calc(100vh - 62px)"
      transition="all 0.5s ease"
    >
      {quitRate > 100 && <BounceText />}
      <Box
        maxWidth="1000px"
        margin="auto"
        p={5}
        // placeholder 데이터(이전 period 결과)를 보여주는 동안 살짝 dim — 새 데이터로 교체될
        opacity={isPlaceholderData ? 0.6 : 1}
        transition="opacity 0.2s ease"
        pointerEvents={isFetching && isPlaceholderData ? 'none' : 'auto'}
      >
        <Card
          bg="whiteAlpha.800"
          borderRadius="2xl"
          boxShadow="0 1px 2px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(250, 250, 250, 0.2)"
        >
          <CardHeader>
            <VStack spacing={4} align="start">
              <Box>
                <HStack spacing={2} align="center">
                  <Heading size="lg" color="blue.600">
                    {latestBusinessData?.company_nm || '회사명 없음'}
                  </Heading>
                  {latestBusinessData?.hash && (
                    <FavoriteToggle
                      hash={latestBusinessData.hash}
                      companyNm={latestBusinessData.company_nm}
                      size="md"
                    />
                  )}
                </HStack>
                <Text color="gray.500">
                  최근 업데이트: {latestBusinessData?.created_dt || '-'}
                </Text>
                <Text color="gray.500">
                  최초 등록일(추정 설립일): {latestBusinessData?.applied_date || '-'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  조회 기간 선택
                </Text>
                <PeriodSwitch
                  options={PERIOD_OPTIONS}
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                />
              </Box>
            </VStack>
          </CardHeader>

          <CardBody>
            <VStack spacing={6} align="stretch">
              <BusinessStats
                latestBusinessData={latestBusinessData || {}}
                totalNew={totalNew}
                totalQuit={totalQuit}
                newPercentChange={newPercentChange}
                quitPercentChange={quitPercentChange}
                quitRate={quitRate}
                selectedPeriod={selectedPeriod}
              />
              <Divider />

              <Box>
                <Heading size="md" mb={4}>
                  직원 변동 추이
                </Heading>
                {sortedData.length > 0 ? (
                  <EmployeeChart data={sortedData} />
                ) : (
                  <Text>데이터가 없습니다.</Text>
                )}
              </Box>
            </VStack>
            <Divider />
          </CardBody>

          <CardBody>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" mb={4}>
                  DART 문서 조회
                </Heading>
                {isDartLoading || !latestBusinessData?.company_nm ? (
                  <Center py={8}>
                    <Spinner color="blue.500" thickness="3px" size="md" />
                  </Center>
                ) : dartData.length > 0 ? (
                  <DartData data={dartData} />
                ) : (
                  <Text color="gray.500">DART 문서 데이터가 없습니다.</Text>
                )}
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  )
}
