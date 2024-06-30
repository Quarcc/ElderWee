export const PieChartData = {
    labels: [
        "Password Related",
        "Account Related",
        "Transaction Related",
        "General Queries",
    ],
    datasets: [
        {
            label: "Customer Reports",
            data: [23, 17, 11, 12],
            backgroundColor: [
                "rgba(255, 210, 0)",
                "rgba(246, 141, 43)",
                "rgba(244, 167, 157)",
                "rgba(52, 75, 253)",
            ],
            hoverOffset: 4,
        }
    ]
}

export const PieChartOption = {
    aspectRatio: 1.25,
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
        },
    },
}