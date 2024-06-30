import { Line } from 'react-chartjs-2'
import { LineChartData, LineChartOption } from './adminLineData';
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
} from 'chart.js'
// works horr
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

export const LineGraph = () => {

    return (
        <Line options={LineChartOption} data={LineChartData} />
    )
        
};