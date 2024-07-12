import Card from 'react-bootstrap/Card';
import React, { useEffect, useState } from 'react';

import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import PollRoundedIcon from '@mui/icons-material/PollRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import { pink, orange, purple, blue } from '@mui/material/colors';

export const KPIBox = () => {
    const [userCount, setUserCount] = useState(0);
    const [transactionCount, setTransactionCount] = useState(0);
    const [totalTransactionAmount, setTotalTransactionAmount] = useState(0)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserCount = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/userCount');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setUserCount(data.count);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        const fetchTransactionCount = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/transactionCount');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTransactionCount(data.count);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        const fetchTotalTransactionAmount = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/totalTransactionAmount');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTotalTransactionAmount(data.totalAmount);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        fetchUserCount();
        fetchTransactionCount();
        fetchTotalTransactionAmount();
    }, []);

    if (loading) {
        return <div>Loading ...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const KPIData = [
        { icon: <PersonAddAltRoundedIcon sx={{ fontSize: 40, color: pink[600] }} />, total: userCount, title: 'New Account', style: { width: '23rem', borderRadius: "20px" } },
        { icon: <PaidRoundedIcon sx={{ fontSize: 40, color: purple[300] }} />, total: transactionCount, title: 'New Transaction', style: { width: '23rem', borderRadius: "20px" } },
        { icon: <PollRoundedIcon sx={{ fontSize: 40, color: orange[600] }} />, total: `$${totalTransactionAmount}`, title: 'Amount Saved', style: { width: '23rem', borderRadius: "20px" } },
        { icon: <ArticleRoundedIcon sx={{ fontSize: 40, color: blue[600] }} />, total: 63, title: 'New Queries', style: { width: '23rem', borderRadius: "20px" } }
    ];

    return (
        <div className="KPI-container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            {KPIData.map((section, index) => (
                <Card className="KPI-card" key={index} border="secondary" style={section.style}>
                    <Card.Body>
                        <Card.Text className="KPI-icon">{section.icon}</Card.Text>
                        <Card.Text className='KPI-total' style={{ fontSize: '40px' }}>{section.total}</Card.Text>
                        <Card.Title className='KPI-total'>{section.title}</Card.Title>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
}
