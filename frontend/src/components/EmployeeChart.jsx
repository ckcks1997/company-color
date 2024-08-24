import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const EmployeeChart = ({ data }) => {

  // yAxis max값 조절 함수
  const calculateYAxisProps = (maxValue) => {
    let roundedMax = 0;
    if (maxValue <= 10) {
      roundedMax = 20;
    }
    else if (maxValue <= 30) {
      roundedMax = 50;
    }
    else if (maxValue <= 50) {
      roundedMax = 80;
    }
    else if (maxValue <= 100) {
      roundedMax = 150;
    }
    else if (maxValue <= 500) {
      roundedMax = 800;
    }
    else if (maxValue <= 1000) {
      roundedMax = 1500;
    }
    else {
      roundedMax = Math.round(maxValue*2/100)*100;
    }
    return { max: roundedMax};
  };


  const [chartOptions, setChartOptions] = useState({
    chart: {
      height: 350,
      type: 'line',
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: {
      width: [5, 5],
      curve: 'straight',
      dashArray: [0, 0]
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
    xaxis: { categories: [] },
    yaxis: [
      {
        title: {
          text: "입/퇴사자 수",
        },
        labels: {
          formatter: (val) => Math.round(val)
        },
        tickAmount:8
      },
      {
        opposite: true,
        title: {
          text: "전체 인원",
        },
        labels: {
          formatter: (val) => Math.round(val)
        },
        tickAmount:8
      }
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        { title: { formatter: (val) => `${val}명` } },
        { title: { formatter: (val) => `${val}명` } }
      ]
    },
    grid: { borderColor: '#f1f1f1' }
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
      const totalAxisProps = calculateYAxisProps(maxTotal);

      setChartOptions(prevOptions => ({
        ...prevOptions,
        xaxis: { ...prevOptions.xaxis, categories: months },
         yaxis: [
          {
            ...prevOptions.yaxis[0],
            min:0,
            ...newQuitAxisProps,
          },
          {
            ...prevOptions.yaxis[1],
            min:0,
            ...totalAxisProps,
          }
        ]
      }));

      setChartSeries([
        { name: "입사자", data: newEmployees },
        { name: "퇴사자", data: quitEmployees },
        { name: "전체인원", data: totalEmployees },
      ]);
    }
  }, [data]);

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