export const LineChartData = {
    labels: [
        "Monday",
        "Tuesday",
        "Wedsnesday",
        "Thurday",
        "Friday",
        "Saturday",
        "Sunday"
    ],
    datasets: [
        {
            label: "This Week",
            data: [20, 18, 25, 15, 24, 35, 14],
            fill: true,
            borderColor: "rgb(255, 92, 0)",
            backgroundColor: "rgba(255, 92, 0, 0.2)",
        },
        {
            label: "Last Week",
            data: [20, 16, 30, 11, 26, 18, 43],
            fill: true,
            borderColor: "rgb(100, 118, 255)",
            backgroundColor: "rgba(100, 118, 255, 0.65)",
        }
    ],
}

export const LineChartOption = {
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