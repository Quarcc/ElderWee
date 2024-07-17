import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import Button from '@mui/material/Button';

import '../../css/adminBC.css';

const APIEndPoint = "localhost:8000";

const TransactionDetail = () => {
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    };

    return (
        <div className="container">
          {Transactions.map((block) => {
            if (block.data.TransactionID === transactionID && block.data.TransactionStatus === "Pending") {
                return (
                    <div className="row">
                        <div className="col d-flex justify-content-end">
                            <Button variant="outlined" color="error" className='me-3'> 
                                Rollback
                            </Button>
                            <Button variant="outlined" color="success" className="ms-3"> 
                                Release
                            </Button>
                        </div>
                        <div className="row mt-3">
                            <h5 className="col">Block Number</h5>
                            <h5 className="col">Transaction ID</h5>
                            <h5 className="col">Transaction Status</h5>
                        </div>
                        <div className="row mt-1 mb-3">
                            <div className="col">{block.blockNo}</div>
                            <div className="col">{block.data.TransactionID}</div>
                            <div className="col">{block.data.TransactionStatus}</div>
                        </div>
                        <div className='row mt-3'>
                            <h5 className='col'>Sender Account Number</h5>
                            <h5 className='col'>Receiver Account Number</h5>
                            <h5 className='col'></h5>
                        </div>
                        <div className="row mt-1 mb-3">
                            <div className="col">{block.data.SenderAccountNo}</div>
                            <div className="col">{block.data.ReceiverAccountNo}</div>
                            <div className="col"></div>
                        </div>
                        <div className='row mt-3'>
                            <h5 className='col'>Amount Transacted</h5>
                            <h5 className='col'>Date Transacted</h5>
                            <h5 className='col'></h5>
                            <h5 className='col'></h5>
                        </div>
                        <div className="row mt-1 mb-3">
                            <div className="col">${block.data.TransactionAmount}</div>
                            <div className="col">{formatDate(block.data.TransactionDate)}</div>
                            <div className="col"></div>
                            <div className="col"></div>
                        </div>
                        <div className='row mt-3'>
                            <h5 className='col'>Details</h5>
                        </div>
                        <div className="row mt-1 mb-3">
                            <div className="col">{block.data.TransactionDesc != null ? block.data.TransactionDesc : '-'}</div>
                        </div>
                        <div className='row mt-3'>
                            <h5 className='col'>Description</h5>
                        </div>
                        <div className="row mt-1 mb-3">
                            <div className="col">${block.data.TransactionAmount} have been transferred from account number, {block.data.SenderAccountNo}, to account number, {block.data.ReceiverAccountNo}. The date of transaction is on {formatDate(block.data.TransactionDate)}. Transaction is not fulfilled</div>
                        </div>
                    </div>
                );
            }
            else if (block.data.TransactionID === transactionID && block.data.TransactionStatus === "Completed") {
                return (
                    <div className="row">
                        <div className="col d-flex justify-content-end">
                            <Button variant="outlined" color="error" disabled> 
                                Rollback
                            </Button>
                        </div>
                        <div className="row mt-2">
                            <h5 className="col">Block Number</h5>
                            <h5 className="col">Transaction ID</h5>
                            <h5 className="col">Transaction Status</h5>
                        </div>
                        <div className="row mt-1 mb-3">
                            <div className="col">{block.blockNo}</div>
                            <div className="col">{block.data.TransactionID}</div>
                            <div className="col">{block.data.TransactionStatus}</div>
                        </div>
                        <div className='row mt-3'>
                            <h5 className='col'>Sender Account Number</h5>
                            <h5 className='col'>Receiver Account Number</h5>
                            <h5 className='col'></h5>
                        </div>
                        <div className="row mt-1 mb-3">
                            <div className="col">{block.data.SenderAccountNo}</div>
                            <div className="col">{block.data.ReceiverAccountNo}</div>
                            <div className="col"></div>
                        </div>
                        <div className='row mt-3'>
                            <h5 className='col'>Amount Transacted</h5>
                            <h5 className='col'>Date Transacted</h5>
                            <h5 className='col'></h5>
                            <h5 className='col'></h5>
                        </div>
                        <div className="row mt-1 mb-3">
                            <div className="col">${block.data.TransactionAmount}</div>
                            <div className="col">{formatDate(block.data.TransactionDate)}</div>
                            <div className="col"></div>
                            <div className="col"></div>
                        </div>
                        <div className='row mt-3'>
                            <h5 className='col'>Details</h5>
                        </div>
                        <div className="row mt-1 mb-3">
                            <div className="col">{block.data.TransactionDesc != null ? block.data.TransactionDesc : '-'}</div>
                        </div>
                        <div className='row mt-3'>
                            <h5 className='col'>Description</h5>
                        </div>
                        <div className="row mt-1 mb-3">
                            <div className="col">${block.data.TransactionAmount} have been transferred from account number, {block.data.SenderAccountNo}, to account number, {block.data.ReceiverAccountNo}. The date of transaction is on {formatDate(block.data.TransactionDate)}.</div>
                        </div>
                    </div>
                );
            }
          })}
        </div>
      );
}

export default TransactionDetail