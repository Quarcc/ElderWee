export const BarChartData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
        {
            label: 'This Week',
            data: [320, 275, 290, 260, 285, 240, 235],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        },
        {
            label: 'Last Week',
            data: [245, 235, 220, 230, 250, 220, 237],
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
        }
    ]
};

export const BarChartOption = {
    responsive: true,
    maintainAspectRatio: false, // Ensure this is false to control the height with CSS or inline styles
    plugins: {
        legend: {
            position: 'bottom',
        },
        title: {
            display: true,
            text: 'Weekly Transactions Comparison',
        },
    },
    scales: {
        y: {
            beginAtZero: true
        }
    }
};