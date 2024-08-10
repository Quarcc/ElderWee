import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const MoneyFlowChart = () => {
  const [data, setData] = useState({ moneyIn: 0, moneyOut: 0 });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('http://localhost:8000/transaction-summary', { withCredentials: true });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching transaction summary:', error);
      }
    };

    fetchSummary();
  }, []);

  const chartData = {
    labels: ['Money In', 'Money Out'],
    datasets: [
      {
        label: 'Amount',
        data: [data.moneyIn, data.moneyOut],
        backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      }
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: $${context.raw.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Money Flow Chart</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default MoneyFlowChart;
