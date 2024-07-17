// import { Bar } from "react-chartjs-2";
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, } from "chart.js";
// import { BarChartOption, BarChartData } from "./adminBarData"

// ChartJS.register(
//     CategoryScale,
//     LinearScale,
//     BarElement,
//     Title,
//     Tooltip,
//     Legend
//   );

// export const BarChart = () => {
//     return <Bar options={BarChartOption} data={BarChartData}/>
// }

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJs,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJs.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const TransactionChartOption = {
  tension: 0.3,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
        display: true,
        position: 'bottom',
    },
    title: {
        display: true,
        text: 'Weekly Account Comparison',
    },
  },
}

export const TransactionChart = () => {
  const [transactionChartData, setTransactionChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Current Week',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
      },
      {
        label: 'Previous Week',
        data: [],
        borderColor: 'rgba(153, 102, 255, 1)',
      },
    ]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/transaction/weeklyTransaction');
        const { labels, currentWeekData, previousWeekData } = response.data;

        setTransactionChartData({
          labels: labels,
          datasets: [
            {
              label: 'Current Week',
              data: currentWeekData,
              borderColor: 'rgba(75, 192, 192, 1)',
            },
            {
              label: 'Previous Week',
              data: previousWeekData,
              borderColor: 'rgba(153, 102, 255, 1)',
            }
          ]
        })
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Line
      options={TransactionChartOption}
      data={transactionChartData}
    />
  )
}