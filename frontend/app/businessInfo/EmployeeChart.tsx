'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { ApexOptions } from 'apexcharts'
import type { BusinessDataItem } from '@/lib/api/types'

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div>차트 로딩중...</div>,
})

interface ChartSeriesItem {
  name: string
  type: 'bar' | 'line'
  data: number[]
}

interface EmployeeChartProps {
  data: BusinessDataItem[]
}

const calculateQuitMaxYAxisProps = (maxValue: number): number => {
  if (!maxValue || maxValue <= 0) return 10
  if (maxValue <= 10) return 12
  if (maxValue <= 30) return 40
  if (maxValue <= 100) return Math.ceil(maxValue / 10) * 10 * 1.1
  if (maxValue <= 1000) return Math.ceil(maxValue / 100) * 100 * 1.1
  return Math.ceil(maxValue / 500) * 500 * 1.1
}

const calculateQuitMinYAxisProps = (minValue: number): number => {
  if (minValue > 1000) return Math.ceil(minValue / 100) * 50
  if (minValue > 100) return Math.ceil(minValue / 10) * 5
  if (minValue > 20) return 10
  return 0
}

const calculateYAxisProps = (maxTotal: number, maxQuit: number): number => {
  const roundedMax = calculateQuitMaxYAxisProps(maxTotal) / 5
  return maxQuit > roundedMax ? maxQuit : roundedMax
}

interface ChartData {
  options: ApexOptions
  series: ChartSeriesItem[]
}

const buildChart = (data: BusinessDataItem[]): ChartData => {
  const sortedData = [...data].sort(
    (a, b) => new Date(a.created_dt).getTime() - new Date(b.created_dt).getTime()
  )
  const months = sortedData.map((item) => item.created_dt || '')
  const newEmployees = sortedData.map((item) => item.subscriber_new || 0)
  const quitEmployees = sortedData.map((item) => item.subscriber_quit || 0)
  const totalEmployees = sortedData.map((item) => item.subscriber_cnt || 0)

  const maxNewQuit = Math.max(...newEmployees, ...quitEmployees, 1)
  const minTotal = Math.min(...totalEmployees, 0)
  const maxTotal = Math.max(...totalEmployees, 1)
  const newQuitAxisMax = calculateYAxisProps(maxTotal, maxNewQuit)
  const totalMinAxis = calculateQuitMinYAxisProps(minTotal)
  const totalMaxAxis = calculateQuitMaxYAxisProps(maxTotal)

  const options: ApexOptions = {
    chart: { height: 380, type: 'line', zoom: { enabled: false } },
    colors: ['#269bda', '#FF4560', '#fab62e'],
    dataLabels: { enabled: false },
    stroke: { width: [1, 1, 2], curve: 'straight', dashArray: [0, 0, 0] },
    title: { text: '월별 입/퇴사자 현황', align: 'left' },
    legend: {
      tooltipHoverFormatter: (val, opts) => {
        if (!opts) return val
        return val + ' - ' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + '명'
      },
    },
    markers: { size: 0, hover: { sizeOffset: 6 } },
    xaxis: {
      type: 'category',
      categories: months,
      labels: { rotate: -45, rotateAlways: false, hideOverlappingLabels: true },
    },
    yaxis: [
      {
        title: { text: '입/퇴사자 수' },
        seriesName: ['입사자', '퇴사자'],
        labels: { formatter: (val: number) => String(Math.round(val)) },
        min: 0,
        max: newQuitAxisMax,
      },
      {
        opposite: true,
        title: { text: '전체 인원' },
        labels: { formatter: (val: number) => String(Math.round(val)) },
        min: totalMinAxis,
        max: totalMaxAxis,
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y: number) => {
          if (typeof y !== 'undefined') return y.toFixed(0) + ' 명'
          return String(y)
        },
      },
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: { height: 280 },
          legend: { show: false },
          xaxis: {
            categories: months,
            labels: { rotate: -90, offsetY: 0 },
            tickAmount: 6,
          },
          yaxis: [
            {
              title: { text: undefined },
              seriesName: ['입사자', '퇴사자'],
              labels: {
                formatter: (val: number) => String(Math.round(val)),
                style: { fontSize: '10px' },
              },
              forceNiceScale: true,
              tickAmount: 6,
              min: 0,
              max: newQuitAxisMax,
            },
            {
              opposite: true,
              title: { text: undefined },
              labels: {
                formatter: (val: number) => String(Math.round(val)),
                style: { fontSize: '10px' },
              },
              forceNiceScale: true,
              tickAmount: 6,
              min: 0,
              max: totalMaxAxis,
            },
          ],
        },
      },
    ],
  }

  const series: ChartSeriesItem[] = [
    { name: '입사자', type: 'bar', data: newEmployees },
    { name: '퇴사자', type: 'bar', data: quitEmployees },
    { name: '전체인원', type: 'line', data: totalEmployees },
  ]

  return { options, series }
}

const EmployeeChart = ({ data }: EmployeeChartProps) => {
  const hasData = Array.isArray(data) && data.length > 0
  const { options, series } = useMemo(
    () => (hasData ? buildChart(data) : { options: {} as ApexOptions, series: [] }),
    [data, hasData]
  )

  if (!hasData) {
    return <div>직원 데이터가 없습니다.</div>
  }

  return (
    <div className="chart-container">
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  )
}

export default EmployeeChart
