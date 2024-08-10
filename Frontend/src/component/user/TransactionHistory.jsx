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
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.TransactionID}>
                <td>{new Date(transaction.TransactionDate).toLocaleDateString()}</td>
                <td>{transaction.Sender ? transaction.Sender.FullName : '-'}</td>
                <td>{transaction.Receiver ? transaction.Receiver.FullName : '-'}</td>
                <td className={`amount ${transaction.TransactionType === 'Top Up' ? 'deposit' : 'withdrawal'}`}>
                  {transaction.TransactionType === 'Top Up' ? '+' : '-'}${transaction.TransactionAmount.toFixed(2)}
                </td>
                <td>{transaction.TransactionDesc || '-'}</td>
              </tr>
            ))}
          </tbody>
          
        <button className="back-button" onClick={handleBack}>← Back</button>
        </table>
        
      )}
    </div>
  );
};

export default TransactionHistory;