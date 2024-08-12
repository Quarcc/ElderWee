import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import WarningIcon from '@mui/icons-material/Warning';

const APIEndPoint = 'localhost:8000';
const ServerEndPoint = 'localhost:4000';
const socket = io(`http://${ServerEndPoint}`);

const DMZZone = () => {
    const [transactions, setTransactions] = useState([]);
    const [funds, setFunds] = useState([]);
    const [frozen, setFrozen] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null); // State to handle selected transaction
    const [open, setOpen] = useState(false);
    const [open1, setOpen1] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleOpen1 = () => setOpen1(true);
    const handleClose1 = () => setOpen1(false);

    const rollbackModal = {
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

    const releaseModal = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        bgcolor: '#50C878',
        boxShadow: 24,
        color: 'black',
        p: 4,
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    };

    const handleFrozenDetail = async (id) => {
        try {
            document.querySelector('.frozen-transaction-dmz').style.display = 'none';
            document.querySelector('.detailed-frozen-transaction').style.display = 'block';

            const response = await axios.get(`http://${APIEndPoint}/api/FrozenTransactions/${id}`);
            const frozenDetails = response.data;

            setFrozen(frozenDetails);
            setSelectedTransaction(frozenDetails[0]); // Assuming the response contains an array with one item
        } catch (error) {
            console.error('Error fetching frozen details:', error);
        }
    };

    const handleFrozenDMZ = () => {
        document.querySelector('.frozen-transaction-dmz').style.display = 'block';
        document.querySelector('.detailed-frozen-transaction').style.display = 'none';
    }

    const handleRollback = async () => {
        try{
            const res = await axios.put(`http://${APIEndPoint}/api/transaction/rollback/id/${selectedTransaction.TransactionID}`);
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

    const handleRelease = async () => {
        try{
            const res = await axios.put(`http://${APIEndPoint}/api/transaction/release/id/${selectedTransaction.TransactionID}`);
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

    useEffect(() => {
        socket.on('newTransaction', (transaction) => {
            setTransactions(prevTransactions => [...prevTransactions, transaction]);

            setTimeout(() => {
                setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== transaction.id));
            }, 5000);
        });

        return () => {
            socket.off('newTransaction');
        };
    }, []);

    useEffect(() => {
        const getFunds = async () => {
            try {
                const FrozenFunds = await axios.get(`http://${APIEndPoint}/api/FrozenTransactions`);
                setFunds(FrozenFunds.data);
            } catch (err) {
                console.log('Error getting frozen funds:', err);
            }
        };

        getFunds();
    }, []);

    return (
        <div className="d-flex ms-5 me-5 mt-4">
            <div className="col me-2 mainZoneBox">
                <h2 className="mt-2" style={{ 'font-weight': '600', position: 'sticky' }}>Demilitarized Zone</h2>
                <div className="dmz-container flex-wrap d-flex justify-content-start align-items-start">
                    {transactions.map((transaction) => (
                        <Button
                            key={transaction.id}
                            style={{ padding: 0, margin: 0, textTransform: 'none', color: 'black', textAlign: 'left', textDecoration: 'none' }}
                        >
                            <div className="dmz-box">
                                <p>ID : {transaction.id}</p>
                                <p>Amount : ${transaction.amount}</p>
                                <p>Reason : {transaction.status}</p>
                            </div>
                        </Button>
                    ))}
                </div>
            </div>
            <div className="col ms-2 mainZoneBox detailed-frozen-transaction">
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="mt-2" style={{ 'font-weight': '600', position: 'sticky' }}>Details</h2>
                    <div className="d-flex justify-content-center align-items-center">
                        <Button className="me-3" variant="outlined" color="error" style={{ borderRadius: '100px' }} onClick={handleOpen}>Rollback</Button>
                        <Button className="ms-3 me-3" variant="outlined" color="success" style={{ borderRadius: '100px' }} onClick={handleOpen1}>Release</Button>
                    </div>
                </div>
                <div className="dmz-container-frozen-detailed justify-content-start align-items-start">
                    {selectedTransaction && (
                        <>
                            <div className="col-12">
                                <h5>Transaction ID</h5>
                                <p>#{selectedTransaction.TransactionID}</p>
                            </div>
                            <div className="col-12 d-flex">
                                <div className="col">
                                    <h5>Sender Account No</h5>
                                    <p>{selectedTransaction.SenderAccountNo}</p>
                                </div>
                                <div className="col">
                                    <h5>Receiver Account No</h5>
                                    <p>{selectedTransaction.ReceiverAccountNo}</p>
                                </div>
                            </div>
                            <div className="col-12">
                                <h5>Transaction Amount</h5>
                                <p>${selectedTransaction.TransactionAmount}</p>
                            </div>
                            <div className="col-12">
                                <h5>Transaction Date</h5>
                                <p>{formatDate(selectedTransaction.TransactionDate)}</p>
                            </div>
                            <div className="col-12">
                                <h5>Reason</h5>
                                <p>{selectedTransaction.Reason}</p>
                            </div>
                            <Button variant="contained" style={{ borderRadius: '100px' }} onClick={handleFrozenDMZ}>Cancel</Button>
                        </>
                    )}
                </div>
            </div>
            <div className="col ms-2 mainZoneBox frozen-transaction-dmz">
                <h2 className="mt-2" style={{ 'font-weight': '600', position: 'sticky' }}>Frozen Funds</h2>
                <div className="dmz-container-frozen flex-wrap d-flex justify-content-start align-items-start">
                    {funds.map((transaction) => (
                        <Button
                            key={transaction.TransactionID}
                            style={{ padding: 0, margin: 0, textTransform: 'none', color: 'black', textAlign: 'left', textDecoration: 'none' }}
                            onClick={() => handleFrozenDetail(transaction.TransactionID)}
                        >
                            <div className="dmz-box-frozen">
                                <p>ID : {transaction.TransactionID}</p>
                                <p>Amount : ${transaction.TransactionAmount}</p>
                                <p>*{transaction.Reason}</p>
                            </div>
                        </Button>
                    ))}
                </div>
            </div>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={rollbackModal}>
                    <Typography className="d-flex justify-content-center" id="modal-modal-title">
                        <WarningIcon sx={{ color: 'white', fontSize: '50px' }} />
                    </Typography>
                    <Typography className="d-flex justify-content-center" sx={{ mt: 2, fontSize: '25px' }}>
                        <b>ARE YOU SURE?</b>
                    </Typography>
                    <Typography className="d-flex justify-content-center text-center" sx={{ mt: 2 }}>
                        You are about to rollback this transaction. <br />
                        By doing so, this transaction will be canceled and funds will be returned to the sender. <br />
                        This rollback cannot be overwritten or reversed by any administrator after it has been done.
                    </Typography>
                    {selectedTransaction && (
                        <Typography id="modal-modal-description" className="d-flex justify-content-center text-center" sx={{ mt: 2 }}>
                            ${selectedTransaction.TransactionAmount} will be returned to account number, {selectedTransaction.SenderAccountNo}. <br />
                            ${selectedTransaction.TransactionAmount} will be deducted from account number, {selectedTransaction.ReceiverAccountNo}. <br />
                            An email notification will be sent to both account owners.
                        </Typography>
                    )}
                    <Typography id="modal-modal-description" className="d-flex justify-content-center text-center" sx={{ mt: 2 }}>
                        <Button variant="contained" className="me-5" onClick={handleClose}>Close</Button>
                        <Button variant="contained" className="ms-5" onClick={handleRollback}>Rollback</Button>
                    </Typography>
                </Box>
            </Modal>
            <Modal open={open1} onClose={handleClose1} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={releaseModal}>
                    <Typography className="d-flex justify-content-center" id="modal-modal-title">
                        <WarningIcon sx={{ color: 'black', fontSize: '50px' }} />
                    </Typography>
                    <Typography className="d-flex justify-content-center" sx={{ mt: 2, fontSize: '25px' }}>
                        <b>ARE YOU SURE?</b>
                    </Typography>
                    <Typography className="d-flex justify-content-center text-center" sx={{ mt: 2 }}>
                        You are about to release this transaction. <br />
                        By doing so, this transaction will be fulfilled and funds will be sent to the receiver. <br />
                        This release cannot be overwritten or reversed by any administrator after it has been done.
                    </Typography>
                    {selectedTransaction && (
                        <Typography id="modal-modal-description" className="d-flex justify-content-center text-center" sx={{ mt: 2 }}>
                            ${selectedTransaction.TransactionAmount} will be released to account number, {selectedTransaction.ReceiverAccountNo}. <br />
                            ${selectedTransaction.TransactionAmount} will be deducted from account number, {selectedTransaction.SenderAccountNo}. <br />
                            An email notification will be sent to both account owners.
                        </Typography>
                    )}
                    <Typography id="modal-modal-description" className="d-flex justify-content-center text-center" sx={{ mt: 2 }}>
                        <Button variant="contained" className="me-5" onClick={handleClose1}>Close</Button>
                        <Button variant="contained" className="ms-5" onClick={handleRelease}>Release</Button>
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
};

export default DMZZone;