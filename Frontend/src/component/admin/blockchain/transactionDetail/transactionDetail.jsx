import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import WarningIcon from '@mui/icons-material/Warning';

import '../../css/adminBC.css';

const APIEndPoint = "localhost:8000";

const TransactionDetail = () => {
    const { transactionID } = useParams();
    const [Transactions, setTransactions] = useState([]);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        getBlockchainData();
        getDBData();
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

    const modalstyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        bgcolor: '#D13535',
        boxShadow: 24,
        color: 'white',
        p: 4,
    };

    const handleRollback = async () => {
        try{
            const res = await axios.put(`http://${APIEndPoint}/api/transaction/rollback/id/${transactionID}`);
            console.log(res);
            window.location.reload();
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

    let checkSum = [];

    return (
        <div className="container">
          {Transactions.map((block) => {
            if (block.data.TransactionID === transactionID && block.data.TransactionStatus === "Completed") {
                return (
                    <div className="row">
                        <div className="col d-flex justify-content-end">
                            <Button variant="outlined" color="error" className="me-3" disabled> 
                                Rollback
                            </Button>
                            <Button variant="outlined" color="success" className="ms-3" disabled> 
                                Release
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
            else if (block.data.TransactionID === transactionID && block.data.TransactionStatus === "Returned") {
                return (
                    <div className="row">
                        <div className="col d-flex justify-content-end">
                            <Button variant="outlined" color="error" className="me-3" disabled> 
                                Rollback
                            </Button>
                            <Button variant="outlined" color="success" className="ms-3" disabled> 
                                Release
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
            else if (block.data.TransactionID === transactionID && block.data.TransactionStatus === "Pending") {
                return (
                    <div className="row">
                        <div className="col d-flex justify-content-end">
                            <Button variant="outlined" color="error" className='me-3' onClick={handleOpen}> 
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
                        <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                            <Box sx={modalstyle}>
                                <Typography className="d-flex justify-content-center" id="modal-modal-title">
                                    <WarningIcon sx={{ color: 'white', fontSize: '50px' }}/>
                                </Typography>
                                <Typography className="d-flex justify-content-center" sx={{ mt: 2, fontSize: '25px' }}>
                                    <b>ARE YOU SURE?</b>
                                </Typography>
                                <Typography className="d-flex justify-content-center text-center" sx={{ mt: 2 }}>
                                    You are about to rollback this transaction. <br />
                                    By doing so, this transaction will be canceled and funds will be returned to the sender. <br />
                                    This rollback cannot be overwritten or reversed by any administrator after it has been done.
                                </Typography>
                                <Typography id="modal-modal-description" className="d-flex justify-content-center text-center" sx={{ mt: 2 }}>
                                    ${block.data.TransactionAmount} will be returned to account number, {block.data.SenderAccountNo}. <br />
                                    ${block.data.TransactionAmount} will be deducted from account number, {block.data.ReceiverAccountNo}. <br />
                                    An email notification will be sent to both account owners.
                                </Typography>
                                <Typography id="modal-modal-description" className="d-flex justify-content-center text-center" sx={{ mt: 2 }}>
                                    <Button variant="contained" className="me-5" onClick={handleClose}>Close</Button>
                                    <Button variant="contained" className="ms-5" onClick={handleRollback}>Rollback</Button>
                                </Typography>
                            </Box>
                        </Modal>
                    </div>
                );
            }
          })}
        </div>
      );
}

export default TransactionDetail