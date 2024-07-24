import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const APIEndPoint = 'localhost:8000';
const ServerEndPoint = 'localhost:4000';
const socket = io(`http://${ServerEndPoint}`);

const DMZZone = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        socket.on('newTransaction', (transaction) => {
            setTransactions(prevTransactions => [...prevTransactions, transaction]);

            setTimeout (() => {
                setTransactions((prevTransactions) => 
                    prevTransactions.filter((t) => t.id !== transaction.id)
                );
            }, 5000);
        });

        return () => {
            socket.off('newTransaction');
        };
    }, [])

    return(
        <div>
            <h2>Demilitarized Zone</h2>
            <div className="dmz-container">
                {transactions.map((transaction) => (
                    <div key={transaction.id} className="dmz-box">
                        <p>ID : {transaction.id}</p>
                        <p>Amount : ${transaction.amount}</p>
                        <p>Status : {transaction.status}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DMZZone;