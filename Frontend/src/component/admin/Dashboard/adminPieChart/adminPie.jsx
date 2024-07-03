import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from "chart.js";
import { PieChartData, PieChartOption } from './adminPieData'

ChartJS.register(
    Tooltip,
    Legend,
    ArcElement,
);

export const PieChart = () => {
    return <Doughnut options={PieChartOption} data={PieChartData} style={{ height: 400, width: 400}}/>
}