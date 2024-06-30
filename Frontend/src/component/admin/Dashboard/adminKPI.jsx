import Card from 'react-bootstrap/Card'


import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import PollRoundedIcon from '@mui/icons-material/PollRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';


export const KPIBox = () => {
    const KPIData = [
        { icon: <PersonAddAltRoundedIcon />, total: 149, title: 'New Account' },
        { icon: <PaidRoundedIcon />, total: 149, title: 'New Transaction' },
        { icon: <PollRoundedIcon />, total: 149, title: 'Amount Saved' },
        { icon: <ArticleRoundedIcon />, total: 149, title: 'New Queries' }
    ]
    return (
        <div classname="KPI-card" style={{ display: 'flex', flexDirection: 'row'}}>
        {KPIData.map((section, index) => (
            <Card key={index} border="primary" style={{  width: "23rem", borderRadius: '20px' }}>
                <Card.Body>
                    <Card.Text>{section.icon}</Card.Text>
                    <Card.Text>{section.total}</Card.Text>
                    <Card.Title>{section.title}</Card.Title>
                </Card.Body>
            </Card>
        ))}
        </div>
    )
}
