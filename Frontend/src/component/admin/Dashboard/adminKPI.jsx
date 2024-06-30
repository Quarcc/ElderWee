import Card from 'react-bootstrap/Card'


import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import PollRoundedIcon from '@mui/icons-material/PollRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import { pink } from '@mui/material/colors';
import { orange } from '@mui/material/colors';
import { purple } from '@mui/material/colors';
import { blue } from '@mui/material/colors';




export const KPIBox = () => {
    const KPIData = [
        { icon: <PersonAddAltRoundedIcon sx={{ fontSize: 40, color: pink[600] }} />, total: 149, title: 'New Account', style: { width: '23rem', borderRadius: "20px" } },
        { icon: <PaidRoundedIcon sx={{ fontSize: 40, color: purple[300] }} />, total: 1905, title: 'New Transaction', style: {  width: '23rem', borderRadius: "20px" } },
        { icon: <PollRoundedIcon sx={{ fontSize: 40, color: orange[600] }} />, total: '$45,945', title: 'Amount Saved', style: {  width: '23rem', borderRadius: "20px"} },
        { icon: <ArticleRoundedIcon sx={{ fontSize: 40, color: blue[600] }}  />, total: 63, title: 'New Queries', style: {  width: '23rem', borderRadius: "20px" }}
    ]
    return (
        <div classname="KPI-container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        {KPIData.map((section, index) => (
            <Card classname="KPI-card" key={index} border="secondary" style={section.style}>
                <Card.Body>
                    <Card.Text classname="KPI-icon">{section.icon}</Card.Text>
                    <Card.Text className='KPI-total' style={{ fontSize: '40px'}}>{section.total}</Card.Text>
                    <Card.Title className='KPI-total'>{section.title}</Card.Title>
                </Card.Body>
            </Card>
        ))}
        </div>
    )
}
