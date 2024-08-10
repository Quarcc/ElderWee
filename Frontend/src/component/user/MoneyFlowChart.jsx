import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const MoneyFlowChart = () => {
  const [data, setData] = useState({ moneyIn: 0, moneyOut: 0 });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current month
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('http://localhost:8000/transaction-summary', {
          params: { month: selectedMonth },
          withCredentials: true
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transaction summary:', error);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchSummary();
  }, [selectedMonth]);

  const chartData = {
    labels: ['Money In', 'Money Out'],
    datasets: [
      {
        label: 'Money In',
        data: [data.moneyIn, 0], // 0 for Money Out to show only Money In here
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Money Out',
        data: [0, data.moneyOut], // 0 for Money In to show only Money Out here
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
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
          label: (context) => `${context.dataset.label}: $${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  const netMoneyFlow = data.moneyIn - data.moneyOut;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Money Flow Chart</h2>
      <label htmlFor="month-selector">Select Month:</label>
      <input
        type="month"
        id="month-selector"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        style={{ marginBottom: '20px', display: 'block' }}
      />
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">Error: {error}</p>
      ) : (
        <>
          <Bar data={chartData} options={options} />
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', width: '45%', backgroundColor: '#f0f8ff' }}>
              <h4>Money In</h4>
              <p style={{ fontSize: '24px', color: 'green' }}>${data.moneyIn.toFixed(2)}</p>
            </div>
            <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', width: '45%', backgroundColor: '#ffebee' }}>
              <h4>Money Out</h4>
              <p style={{ fontSize: '24px', color: 'red' }}>${data.moneyOut.toFixed(2)}</p>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <h4>Net Money Flow</h4>
            <p style={{ fontSize: '24px', color: netMoneyFlow >= 0 ? 'green' : 'red' }}>
              ${netMoneyFlow.toFixed(2)}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default MoneyFlowChart;
