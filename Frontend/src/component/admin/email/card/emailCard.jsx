import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const APIEndPoint = 'localhost:8000';

const EmailCard = () => {
    const [funds, setFunds] = useState([]);
    const [fundsTodayList, setFundsTodayList] = useState([]);
    const [fundsYesterdayList, setFundsYesterdayList] = useState([]);
    const [fundsTotal, setFundsTotal] = useState(0);
    const [fundsHold, setFundsHold] = useState(0);
    const [fundsHoldOne, setFundsHoldOne] = useState(0);
    const [fundsHoldTwo, setFundsHoldTwo] = useState(0);
    const [fundsHoldChange, setFundsHoldChange] = useState('');
    const [fundsReturned, setFundsReturned] = useState(0);
    const [fundsReturnedOne, setFundsReturnedOne] = useState(0);
    const [fundsReturnedTwo, setFundsReturnedTwo] = useState(0);
    const [fundsReturnedChange, setFundsReturnedChange] = useState('');

    const getFunds = async () => {
        try {
            const response = await axios.get(`http://${APIEndPoint}/api/FrozenFunds`);
            setFunds(response.data);
        } catch (error) {
            console.error("Error fetching funds data", error);
        }
    }

    const getTodayFunds = async () => {
        try {
            const response = await axios.get(`http://${APIEndPoint}/api/FrozenFunds/Today`);
            setFundsTodayList(response.data);
        } catch (error) {
            console.error("Error fetching today's funds data", error);
        }
    }

    const getYesterdayFunds = async () => {
        try {
            const response = await axios.get(`http://${APIEndPoint}/api/FrozenFunds/Yesterday`);
            setFundsYesterdayList(response.data);
        } catch (error) {
            console.error("Error fetching yesterday's funds data", error);
        }
    }

    useEffect(() => {
        getFunds();
        getTodayFunds();
        getYesterdayFunds();
    }, []);

    useEffect(() => {
        const filterReturned = () => {
            let totalReturned = 0;
            let heldFund = 0;

            funds.forEach((fund) => {
                if (fund.TransactionStatus === 'Returned') {
                    totalReturned += parseFloat(fund.TransactionAmount);
                }

                if (fund.TransactionStatus === 'Pending') {
                    heldFund += parseFloat(fund.TransactionAmount);
                }
            });
            setFundsTotal(totalReturned.toLocaleString());
            setFundsHold(heldFund);
        };

        filterReturned();
    }, [funds]);

    useEffect(() => {
        const filterToday = () => {
            let heldFundOne = 0;
            let returnedFundOne = 0;

            fundsTodayList.forEach((fund) => {
                if (fund.TransactionStatus === 'Returned') {
                    returnedFundOne += parseFloat(fund.TransactionAmount);
                }

                if (fund.TransactionStatus === 'Pending') {
                    heldFundOne += parseFloat(fund.TransactionAmount);
                }
            });

            setFundsReturned(returnedFundOne);
            setFundsHoldOne(heldFundOne);
            setFundsReturnedOne(returnedFundOne);
        };

        filterToday();
    }, [fundsTodayList]);

    useEffect(() => {
        const filterYesterday = () => {
            let heldFundTwo = 0;
            let returnedFundTwo = 0;

            fundsYesterdayList.forEach((fund) => {
                if (fund.TransactionStatus === 'Returned') {
                    returnedFundTwo += parseFloat(fund.TransactionAmount);
                }

                if (fund.TransactionStatus === 'Pending') {
                    heldFundTwo += parseFloat(fund.TransactionAmount);
                }
            });

            setFundsHoldTwo(heldFundTwo);
            setFundsReturnedTwo(returnedFundTwo);
        };

        filterYesterday();
    }, [fundsYesterdayList]);

    useEffect(() => {
        const formatPercentage = (value) => {
            if (isNaN(value)) {
                return '0';
            }
            else if(!isFinite(value)) {
                return '100';
            }
            return parseFloat(value.toFixed(2)).toString();
        };

        const calculateChanges = () => {
            setFundsHoldChange(formatPercentage(((fundsHoldOne - fundsHoldTwo) / fundsHoldTwo) * 100));
            setFundsReturnedChange(formatPercentage(((fundsReturnedOne - fundsReturnedTwo) / fundsReturnedTwo) * 100));
        };

        if (fundsHoldOne !== null && fundsHoldTwo !== null && fundsReturnedOne !== null && fundsReturnedTwo !== null) {
            calculateChanges();
        }
    }, [fundsHoldOne, fundsHoldTwo, fundsReturnedOne, fundsReturnedTwo]);

    const isHoldNegative = fundsHoldChange[0] === '-';
    const isReturnedNegative = fundsReturnedChange[0] === '-';

    return (
        <div className="d-flex mt-3 ms-auto me-auto">
            <div className="col">
                <Card variant="outlined ms-5 me-5" className="DMZTopThreeCards">
                    <CardContent>
                        <Typography sx={{ fontSize: "16px", fontWeight: 600 }} gutterBottom className="mb-3">
                            Total Funds Returned*
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }} variant="h5" className="mb-3">
                            ${fundsTotal}
                        </Typography>
                        <div className="d-flex align-items-center">
                            <Typography color="text.secondary" style={{ marginLeft: "5px", fontSize: "13px", fontWeight: 600 }}>*since the beginning of time</Typography>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="col">
                <Card variant="outlined me-5" className="DMZTopThreeCards">
                    <CardContent>
                        <Typography sx={{ fontSize: "16px", fontWeight: 600 }}  gutterBottom className="mb-3">
                            Funds On Hold
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }} variant="h5" className="mb-3">
                            {fundsHold.toLocaleString()}
                        </Typography>
                        <div className="d-flex align-items-center">
                            {isHoldNegative ? <KeyboardArrowDownIcon color='error' fontSize="medium"/> : <KeyboardArrowUpIcon color="success" fontSize="medium"/>}
                            <Typography color="text.secondary" style={{ marginLeft: "5px", fontSize: "13px", fontWeight: 600 }}>{fundsHoldChange}% from yesterday</Typography>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="col">
                <Card variant="outlined me-5" className="DMZTopThreeCards">
                    <CardContent>
                        <Typography sx={{ fontSize: "16px", fontWeight: 600 }} gutterBottom className="mb-3">
                            Funds Returned Today
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }} variant="h5" className="mb-3">
                            {fundsReturned}
                        </Typography>
                        <div className="d-flex align-items-center">
                            {isReturnedNegative ? <KeyboardArrowDownIcon color='error' fontSize="medium"/> : <KeyboardArrowUpIcon color="success" fontSize="medium"/>}
                            <Typography color="text.secondary" style={{ marginLeft: "5px", fontSize: "13px", fontWeight: 600 }}>{fundsReturnedChange}% from yesterday</Typography>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default EmailCard;