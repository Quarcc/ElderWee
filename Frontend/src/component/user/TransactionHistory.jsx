import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/TransactionHistory.css';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/transaction-history', { withCredentials: true });
        setTransactions(response.data.transactions);
      } catch (error) {
        setStatusMessage('Failed to fetch transactions');
      }
    };

    fetchTransactions();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="transaction-history">
      <div className="header">
        <h1 className="title">Transaction History</h1>
      </div>
      {statusMessage && <p className="error-message">{statusMessage}</p>}
      {transactions.length === 0 ? (
        <p className="no-transactions">No transactions found.</p>
      ) : (
        <div className="transaction-cards">
          {transactions.map(transaction => (
            <div key={transaction.TransactionID} className="transaction-card">
              <h3 className="transaction-title">{transaction.TransactionType}</h3>
              <p className="transaction-date">{new Date(transaction.TransactionDate).toLocaleDateString()}</p>
              <p className="transaction-receiver"><strong>Receiver:</strong> {transaction.Receiver ? transaction.Receiver.FullName : '-'}</p>
              <p className="transaction-amount">
                <strong>Amount:</strong> 
                <span className={transaction.TransactionType === 'Top Up' ? 'deposit' : 'withdrawal'}>
                  {transaction.TransactionType === 'Top Up' ? '+' : '-'}${transaction.TransactionAmount.toFixed(2)}
                </span>
              </p>
              <p className="transaction-description"><strong>Description:</strong> {transaction.TransactionDesc || '-'}</p>
            </div>
          ))}
        </div>
      )}
      <button className="back-button" onClick={handleBack}>← Back</button>
    </div>
  );
};

export default TransactionHistory;
