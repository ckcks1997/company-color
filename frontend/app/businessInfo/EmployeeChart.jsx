'use client'
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic'

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div>차트 로딩중...</div>
})
const EmployeeChart = ({ data }) => {

  // window 객체가 정의된후에 차트 랜더링
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const calculateYAxisProps = (maxTotal, maxQuit) => {
    let roundedMax = 0;
    roundedMax = calculateQuitMaxYAxisProps(maxTotal) / 5;
    if (maxQuit > roundedMax) return maxQuit;
    return roundedMax;
  };

  const calculateQuitMinYAxisProps = (minValue) => {
    let roundedMin = 0;
    if (minValue > 1000) roundedMin = Math.ceil(minValue / 100) * 50;
    else if (minValue > 100) roundedMin = Math.ceil(minValue / 10) * 5;
    else if (minValue > 20) roundedMin = 10;
    else roundedMin = 0;
    return roundedMin;
  };

    const calculateQuitMaxYAxisProps = (maxValue) => {
    let roundedMax = 0;
    if (maxValue <= 10) roundedMax = 12;
    else if (maxValue <= 30) roundedMax = 40;
    else if (maxValue <= 100) roundedMax = Math.ceil(maxValue / 10) * 10 * 1.1;
    else if (maxValue <= 1000) roundedMax = Math.ceil(maxValue / 100) * 100 * 1.1;
    else roundedMax = Math.ceil(maxValue / 500) * 500 * 1.1;
    return roundedMax;
  };

  const [chartOptions, setChartOptions] = useState({
    chart: {
      height: 380,
      type: 'line',
      zoom: { enabled: false },
    },
    colors: ['#269bda', '#FF4560', '#fab62e'],
    dataLabels: { enabled: false },
    stroke: {
      width: [1, 1, 2],
      curve: 'straight',
      dashArray: [0, 0, 0]
    },
    title: {
      text: '월별 입/퇴사자 현황',
      align: 'left'
    },
    legend: {
      tooltipHoverFormatter: function(val, opts) {
        return val + ' - ' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + '명'
      }
    },
    markers: {
      size: 0,
      hover: { sizeOffset: 6 }
    },
    xaxis: {
      type: 'category',
      categories: [],
      labels: {
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true,
      }
    },
    yaxis: [
      {
        title: {
          text: "입/퇴사자 수",
        },
        seriesName: ["입사자","퇴사자"],
        labels: {
          formatter: (val) => Math.round(val)
        },
      },
      {
        opposite: true,
        title: {
          text: "전체 인원",
        },
        labels: {
          formatter: (val) => Math.round(val)
        },
      }
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (y) {
          if(typeof y !== "undefined") {
            return y.toFixed(0) + " 명";
          }
          return y;
        }
      }
    },
    responsive: [{
      breakpoint: 600,
      options: {
        chart: {
          height: 280
        },
        legend: {
          show: false
        },
        xaxis: {
          labels: {
            rotate: -90,
            offsetY: 0,
          },
          tickAmount: 6
        },
        yaxis: [
          {
            title: {
              text: undefined  // 모바일에서 타이틀 제거
            },
            seriesName: ["입사자","퇴사자"],
            labels: {
              formatter: (val) => Math.round(val),
              style: {
                fontSize: '10px'
              }
            },
            forceNiceScale: true,  // y축 스케일 강제 조정
            tickAmount: 6,  // y축 눈금 수 지정
          },
          {
            opposite: true,
            title: {
              text: undefined  // 모바일에서 타이틀 제거
            },
            labels: {
              formatter: (val) => Math.round(val),
              style: {
                fontSize: '10px'
              }
            },
            forceNiceScale: true,  // y축 스케일 강제 조정
            tickAmount: 6,  // y축 눈금 수 지정
          }
        ]
      }
    }]
  });

  const [chartSeries, setChartSeries] = useState([]);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const sortedData = data.sort((a, b) => new Date(a.created_dt) - new Date(b.created_dt));
      const months = sortedData.map(item => item.created_dt);
      const newEmployees = sortedData.map(item => item.subscriber_new);
      const quitEmployees = sortedData.map(item => item.subscriber_quit);
      const totalEmployees = sortedData.map(item => item.subscriber_cnt);

      const maxNewQuit = Math.max(...newEmployees, ...quitEmployees);
      const minTotal = Math.min(...totalEmployees);
      const maxTotal = Math.max(...totalEmployees);
      const newQuitAxisProps = calculateYAxisProps(maxTotal, maxNewQuit);
      const totalMinAxisProps = calculateQuitMinYAxisProps(minTotal);
      const totalMaxAxisProps = calculateQuitMaxYAxisProps(maxTotal);

      setChartOptions(prevOptions => ({
        ...prevOptions,
        xaxis: {
          ...prevOptions.xaxis,
          categories: months,
        },
        yaxis: [
          {
            ...prevOptions.yaxis[0],
            min: 0,
            max: newQuitAxisProps,
          },
          {
            ...prevOptions.yaxis[1],
            min: totalMinAxisProps,
            max: totalMaxAxisProps,
          }
        ],
        responsive: [
          {
            ...prevOptions.responsive[0],
            options: {
              ...prevOptions.responsive[0].options,
              xaxis: {
                ...prevOptions.responsive[0].options.xaxis,
                categories: months,
              },
              yaxis: [
                {
                  ...prevOptions.responsive[0].options.yaxis[0],
                  min: 0,
                  max: newQuitAxisProps,
                },
                {
                  ...prevOptions.responsive[0].options.yaxis[1],
                  min: 0,
                  max: totalMaxAxisProps,
                }
              ],
            }
          }
        ]
      }));

      setChartSeries([
        { name: "입사자", type: 'bar', data: newEmployees },
        { name: "퇴사자", type: 'bar', data: quitEmployees },
        { name: "전체인원", type: 'line', data: totalEmployees }
      ]);
    }
  }, [data]);

  if (!isBrowser) return null;
  if (!Array.isArray(data) || data.length === 0) {
    return <div>직원 데이터가 없습니다.</div>;
  }

  return (
    <div className="chart-container">
      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="line"
        height={350}
      />
    </div>
  );
};

export default EmployeeChart;