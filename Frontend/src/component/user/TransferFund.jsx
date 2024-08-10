import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltRight, faLongArrowAltLeft } from '@fortawesome/free-solid-svg-icons';
import {
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBContainer,
  MDBInput,
  MDBRow,
} from "mdb-react-ui-kit";

const TransferFund = () => {
  const [receiverIdentifier, setReceiverIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [accountNumber, setAccountNumber] = useState('');
  const navigate = useNavigate();

  // Fetch user balance and account number when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/user-balance', { withCredentials: true });
        setUserBalance(response.data.balance);
        setAccountNumber(response.data.accountNumber);
      } catch (error) {
        setStatusMessage('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();

    try {
        // Check if receiver is registered
        const receiverResponse = await axios.get('http://localhost:8000/check-receiver', {
            params: { identifier: receiverIdentifier },
            withCredentials: true
        });

        // Check if receiver exists
        if (!receiverResponse.data.exists) {
            setStatusMessage('Receiver is not registered');
            return;
        }

        if (receiverResponse.data.message === 'Receiver is flagged as a scammer' || receiverResponse.data.message === 'Receiver\'s account is locked') {
            setStatusMessage(receiverResponse.data.message);
            return;
        }

        // Validate amount and receiver's identifier
        if (parseFloat(amount) > userBalance) {
            setStatusMessage('Insufficient balance.');
            return;
        }

        // Perform transfer
        const transferResponse = await axios.post('http://localhost:8000/transfer', {
            receiverIdentifier,
            amount: parseFloat(amount),
            description,
        }, { withCredentials: true });

        if (transferResponse.data.success) {
            setStatusMessage('Transfer successful!');
        } else {
            setStatusMessage(`Transfer failed: ${transferResponse.data.message}`);
        }
    } catch (error) {
        console.error('Error during transfer:', error.response || error);
        // Check for 404 errors
        if (error.response && error.response.status === 404) {
            setStatusMessage('Receiver is not registered');
        } else {
            setStatusMessage(`Transfer failed: ${error.response ? error.response.data.message : error.message}`);
        }
    }
};




  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#eee' }}>
        <MDBContainer>
            <MDBRow className="d-flex justify-content-center align-items-center">
                <MDBCol md="12" lg="10" xl="8">
                    <MDBCard>
                        <MDBCardBody className="p-md-5">
                            <div className="text-center">
                                <h1>Transfer</h1>
                                <p className="text-muted pb-2">
                                    Transfer funds to another account
                                </p>
                                <div className="d-flex justify-content-between mt-4">
                                    <p className="h6 mb-1">Account Number: {accountNumber}</p>
                                    <p className="h6 mb-1">Balance: ${userBalance.toFixed(2)}</p>
                                </div>
                            </div>
                            <form onSubmit={handleTransfer} noValidate>
                                <MDBInput
                                    className="mt-4"
                                    required
                                    fullWidth
                                    id="receiverIdentifier"
                                    label="Receiver's Phone Number, Account Number, or Email"
                                    name="receiverIdentifier"
                                    value={receiverIdentifier}
                                    onChange={(e) => setReceiverIdentifier(e.target.value)}
                                />
                                <MDBInput
                                    className="mt-4"
                                    required
                                    fullWidth
                                    name="amount"
                                    label="Amount"
                                    type="number"
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                <MDBInput
                                    className="mt-4"
                                    fullWidth
                                    name="description"
                                    label="Description (Optional)"
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                {/* Display status message */}
                                {statusMessage && (
                                    <div className="text-center mt-3">
                                        <p className={statusMessage.includes('failed') || statusMessage.includes('not registered') ? 'text-danger' : 'text-success'}>
                                            {statusMessage}
                                        </p>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between">
                                    <button color="secondary" size="lg" className="mt-3" onClick={() => navigate('/home')}>
                                        <FontAwesomeIcon icon={faLongArrowAltLeft} /> Back
                                    </button>
                                    <button type="submit" color="primary" size="lg" className="mt-3">
                                        Transfer <FontAwesomeIcon icon={faLongArrowAltRight} />
                                    </button>
                                </div>
                            </form>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    </div>
);

};

export default TransferFund;
