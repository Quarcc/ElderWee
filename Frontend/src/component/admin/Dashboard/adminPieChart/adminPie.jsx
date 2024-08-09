import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(Tooltip, Legend, ArcElement);

// Preset options
export const PieChartOption = {
  aspectRatio: 1.25,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
    },
  },
};

const fetchPieChartData = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/enquiries'); // Adjust URL if necessary
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    // Count occurrences of each report type
    const typeCount = data.reduce((acc, item) => {
      const type = item.EnquiryType; // Adjust field if needed
      if (type in acc) {
        acc[type]++;
      } else {
        acc[type] = 1;
      }
      return acc;
    }, {});

    // Convert typeCount to chart data format
    const labels = Object.keys(typeCount);
    const values = Object.values(typeCount);

    // Generate colors dynamically or use a preset set
    const backgroundColors = labels.map((_, index) => 
      `hsl(${(index * 360 / labels.length) % 360}, 70%, 60%)` // Generates a distinct color for each label
    );

    return {
      labels: labels,
      datasets: [
        {
          label: 'Customer Reports',
          data: values,
          backgroundColor: backgroundColors,
          hoverOffset: 4,
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching pie chart data:', error);
    return {
      labels: [],
      datasets: [],
    };
  }
};

export const PieChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    fetchPieChartData().then(data => {
      setChartData(data);
    });
  }, []);

  return (
    <Doughnut
      data={chartData}
      options={PieChartOption}
      style={{ height: 400, width: 400 }}
    />
  );
};
