import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import Button from '@mui/material/Button';

import '../../css/adminBC.css';

const APIEndPoint = "localhost:8000";

const TransactionTrace = () => {
    const { transactionID } = useParams();
    const [Transactions, setTransactions] = useState([]);

    useEffect(() => {
        getBlockchainData();
    }, []);

    const getBlockchainData = async () => {
        try{
            const res = await axios.get(`http://${APIEndPoint}/api/Blockchain`);
            setTransactions(res.data.blockchain);
            
        } catch (error) {
            if (error.response) {
                console.log('Error Response: ' + error.response);
            }
            // Request made with no response
            else if (error.request) {
                console.log('Error Request: ' + error.request);
            }
            // Any other error
            else {
                console.log('Error Message: ' + error.message);
            }
        }
    };

    
}

export default TransactionTrace