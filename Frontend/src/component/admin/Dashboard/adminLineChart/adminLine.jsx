import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

const LineChartOption = {
    tension: 0.3,
    responsive: true,
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

export const LineChart = () => {
    const [lineChartData, setLineChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Current Week',
                data: [],
                fill: true,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
            {
                label: 'Previous Week',
                data: [],
                fill: true,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
            },
        ],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/accounts/weekly');
                const { labels, currentWeekData, previousWeekData } = response.data;

                setLineChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Current Week',
                            data: currentWeekData,
                            fill: true,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        },
                        {
                            label: 'Previous Week',
                            data: previousWeekData,
                            fill: true,
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        },
                    ],
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <Line
            options={LineChartOption}
            data={lineChartData}
        />
    );
};
