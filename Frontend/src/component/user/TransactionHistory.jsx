import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/transactions', { withCredentials: true });
        setTransactions(response.data.transactions);
      } catch (error) {
        setStatusMessage('Failed to fetch transactions');
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Transaction History</h1>
      {statusMessage && <p style={{ color: 'red' }}>{statusMessage}</p>}
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Transaction ID</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Date</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Amount</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Status</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Type</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.TransactionID}>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{transaction.TransactionID}</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{new Date(transaction.TransactionDate).toLocaleDateString()}</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>${transaction.TransactionAmount.toFixed(2)}</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{transaction.TransactionStatus}</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{transaction.TransactionType}</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{transaction.TransactionDesc || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionHistory;
