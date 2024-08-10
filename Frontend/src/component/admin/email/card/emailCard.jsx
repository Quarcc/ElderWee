import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const APIEndPoint = 'localhost:8000';

const EmailCard = () => {
    const [sent, setSent] = useState(0);
    const [opened, setOpened] = useState(0);
    const [openRate, setOpenRate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch sent emails
                const responseSent = await axios.get(`http://${APIEndPoint}/api/emailSent`);
                const totalSent = responseSent.data.reduce((acc, item) => acc + item.EmailSent, 0);
                setSent(totalSent);

                // Fetch opened emails
                const responseOpened = await axios.get(`http://${APIEndPoint}/api/emailOpened`);
                const totalOpened = responseOpened.data.reduce((acc, item) => acc + item.EmailOpened, 0);
                setOpened(totalOpened);
            } catch (error) {
                console.error("Error fetching email data", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (sent > 0) {
            const rate = (opened / sent) * 100;
            setOpenRate(Number.isInteger(rate) ? rate.toFixed(0) : rate.toFixed(2));
        } else {
            setOpenRate('0');
        }
    }, [sent, opened]);

    return (
        <div className="d-flex mt-3 ms-auto me-auto">
            <div className="col">
                <Card variant="outlined ms-5 me-5" className="EmailTopThreeCards">
                    <CardContent>
                        <Typography sx={{ fontSize: "16px", fontWeight: 600 }} gutterBottom className="mb-3">
                            Total Emails Opened*
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }} variant="h5" className="mb-3">
                            {opened}
                        </Typography>
                        <div className="d-flex align-items-center">
                            <Typography color="text.secondary" style={{ marginLeft: "5px", fontSize: "13px", fontWeight: 600 }}>*since the beginning of time</Typography>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="col">
                <Card variant="outlined me-5" className="EmailTopThreeCards">
                    <CardContent>
                        <Typography sx={{ fontSize: "16px", fontWeight: 600 }} gutterBottom className="mb-3">
                            Total Emails Sent*
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }} variant="h5" className="mb-3">
                            {sent}
                        </Typography>
                        <div className="d-flex align-items-center">
                            <Typography color="text.secondary" style={{ marginLeft: "5px", fontSize: "13px", fontWeight: 600 }}>*since the beginning of time</Typography>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="col">
                <Card variant="outlined me-5" className="EmailTopThreeCards">
                    <CardContent>
                        <Typography sx={{ fontSize: "16px", fontWeight: 600 }} gutterBottom className="mb-3">
                            Email Open Rate*
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }} variant="h5" className="mb-3">
                            {openRate}%
                        </Typography>
                        <div className="d-flex align-items-center">
                            <Typography color="text.secondary" style={{ marginLeft: "5px", fontSize: "13px", fontWeight: 600 }}>*since the beginning of time</Typography>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default EmailCard;