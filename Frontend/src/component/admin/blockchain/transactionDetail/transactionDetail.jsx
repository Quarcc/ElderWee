import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import '../../css/adminBC.css';
import { autocompleteClasses } from '@mui/material';

const APIEndPoint = "localhost:8000";

const TransactionDetail = () => {
    const { transactionID } = useParams();
    const [BlockNo, setBlockNo] = useState('');
    const [BlockchainData, setBlockchainData] = useState([]);
    const [Transactions, setTransactions] = useState([]);
    const [TransactionID, setTransactionID] = useState('');
    const [TransactionStatus, setTransactionStatus] = useState('');
    const [SenderAccountNo, setSenderAccountNo] = useState('');
    const [ReceiverAccountNo, setReceiverAccountNo] = useState('');
    const [AmountTransacted, setAmountTransacted] = useState(0);
    const [DateTransacted, setDateTransacted] = useState('');
    const [TransactionDetail, setTransactionDetail] = useState('');
    const [TransactionDesc, setTransactionDesc] = useState('');

    useEffect(() => {
        const getTransactions = async () => {
            await axios.get(`http://${APIEndPoint}/admin/transaction/detail/id/${transactionID}`).then(
                res => {
                    setTransactions(res.data);
                }
            ).catch(
                error => {
                    // anything outside the status code 2xx range
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
            )
        }

        const getBlockchainData = async () => {
            await axios.get(`http://${APIEndPoint}/api/Blockchain`).then(
                res => {
                    setBlockchainData(res.data.blockchain);
                }
            ).catch(
                error => {
                    // anything outside the status code 2xx range
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
            )
        }

        getTransactions();
        getBlockchainData();
    }, []);

    useEffect(() => {
        
    })
}

export default TransactionDetail