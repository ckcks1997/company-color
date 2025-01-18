'use client'
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const EmployeeChart = ({ data }) => {

  // window 객체가 정의된후에 차트 랜더링
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const calculateYAxisProps = (maxValue) => {
    let roundedMax = 0;
    if (maxValue <= 10) roundedMax = 12;
    else if (maxValue <= 30) roundedMax = 40;
    else if (maxValue <= 50) roundedMax = 80;
    else if (maxValue <= 100) roundedMax = 160;
    else if (maxValue <= 300) roundedMax = 500;
    else if (maxValue <= 500) roundedMax = 800;
    else if (maxValue <= 1000) roundedMax = 1500;
    else roundedMax = Math.ceil(maxValue / 1000) * 1200;
    return roundedMax;
  };

    const calculateQuitMaxYAxisProps = (maxValue) => {
    let roundedMax = 0;
    if (maxValue <= 10) roundedMax = 12;
    else if (maxValue <= 30) roundedMax = 40;
    else if (maxValue <= 100) roundedMax = Math.ceil(maxValue / 10) * 12;
    else if (maxValue <= 1000) roundedMax = Math.ceil(maxValue / 100) * 120;
    else roundedMax = Math.ceil(maxValue / 1000) * 1200;
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
      width: [4, 4, 2],
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
      const maxTotal = Math.max(...totalEmployees);
      const newQuitAxisProps = calculateYAxisProps(maxNewQuit);
      const totalAxisProps = calculateQuitMaxYAxisProps(maxTotal);

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
            min: 0,
            max: totalAxisProps,
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
                  max: totalAxisProps,
                }
              ],
            }
          }
        ]
      }));

      setChartSeries([
        { name: "입사자", type: 'line', data: newEmployees },
        { name: "퇴사자", type: 'line', data: quitEmployees },
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