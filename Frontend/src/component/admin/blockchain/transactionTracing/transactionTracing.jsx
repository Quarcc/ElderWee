import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import '../../css/adminBC.css';

const APIEndPoint = "localhost:8000";

const TransactionTrace = () => {
    const { transactionID } = useParams();
    const [Transactions, setTransactions] = useState([]);
    const [finalIteration, setFinalIteration] = useState([]);

    useEffect(() => {
        const getBlockchainData = async () => {
            try {
                const res = await axios.get(`http://${APIEndPoint}/api/Blockchain`);
                setTransactions(res.data.blockchain);
            } catch (error) {
                if (error.response) {
                    console.log('Error Response: ' + error.response);
                } else if (error.request) {
                    console.log('Error Request: ' + error.request);
                } else {
                    console.log('Error Message: ' + error.message);
                }
            }
        };

        getBlockchainData();

    }, []);

    useEffect(() => {
        const renderTrace = () => {
            if (Transactions.length === 0) return; // Ensure Transactions is populated

            let sender;
            let receiver;
            let firstIteration = [];

            Transactions.map((transaction1) => {
                if (transaction1.data.TransactionID === transactionID) {
                    sender = transaction1.data.SenderAccountNo;
                    receiver = transaction1.data.ReceiverAccountNo;

                    Transactions.map((transaction2) => {
                        if (transaction2.data.TransactionStatus === "Pending") {
                            firstIteration.push(transaction2.data);
                        }
                    });

                    firstIteration.map((trx) => {
                        if (
                            trx.SenderAccountNo === sender ||
                            trx.ReceiverAccountNo === receiver ||
                            trx.SenderAccountNo === receiver ||
                            trx.ReceiverAccountNo === sender
                        ) {
                            if (!finalIteration.includes(trx)) {
                                setFinalIteration(prevState => [...prevState, trx]);
                            }
                        }
                    });
                }
            });
        };

        renderTrace();

    }, [Transactions, transactionID]); // Depend on Transactions and transactionID changes

    return (
        <div className='container'>
            {finalIteration.map((trx, index) => (
                <div key={index}>
                    <p>{trx.TransactionID}</p>
                    <p>{trx.SenderAccountNo}</p>
                    <p>{trx.ReceiverAccountNo}</p>
                    <p>{trx.TransactionStatus}</p>
                </div>
            ))}
        </div>
    );
};

export default TransactionTrace;
