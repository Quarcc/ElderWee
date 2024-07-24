import React, { useState, useEffect } from "react";
import axios from 'axios';

import Button from '@mui/material/Button';

const APIEndPoint = "localhost:8000";

const TransactionTest = () => {
    const [formData, setFormData] = useState({
        amt: 0
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value || '' });
    }

    const sendTransaction = () => {
        const data = axios.post(`http://${APIEndPoint}/api/transaction/send/000000000000/receive/111111111111`, formData)
    }

    return (
        <div>
            <h1>Transaction Test</h1>
            <input type="text" id="amt" name="amt" placeholder="amount to send" value={formData.amt} onChange={handleChange}/>
            <Button variant="contained" onClick={sendTransaction}>Send Transaction</Button>
        </div>
    )
}

export default TransactionTest;