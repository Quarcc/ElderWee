import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const APIEndPoint = 'localhost:8000';
const ServerEndPoint = 'localhost:4000';
const socket = io(`http://${ServerEndPoint}`);

const DMZZone = () => {
    const [transactions, setTransactions] = useState([]);
    const [funds, setFunds] = useState([]);

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

    useEffect(() => {
        const getFunds = async () => {
            try{
               const FrozenFunds = await axios.get(`http://${APIEndPoint}/api/FrozenFunds`);
                setFunds(FrozenFunds.data); 
            }
            catch (err) {
                console.log('Error getting frozen funds' + err);
            }   
        }

        getFunds();
    }, [])

    return(
        <div className="d-flex justify-content-center ms-auto me-auto mt-5">
            <div className="col ms-5 me-3 mainZoneBox">
                <h2 className="ps-3 pt-3">Demilitarized Zone</h2>
                <div className="dmz-container d-flex justify-content-center">
                    {transactions.map((transaction) => (
                        <div key={transaction.id} className="dmz-box">
                            <p>ID : {transaction.id}</p>
                            <p>Amount : ${transaction.amount}</p>
                            <p>Status : {transaction.status}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="col me-5 ms-3 mainZoneBox">
                <h2 className="ps-3 pt-3">Frozen Funds</h2>
                <div className="outer-dmz-container">
                    <div className="dmz-container d-flex justify-content-start">   
                    {funds.map((transaction) => (
                        transaction.TransactionStatus === "Pending" ? (
                            <div key={transaction.TransactionID} className="dmz-box">
                            <p>ID : {transaction.TransactionID}</p>
                            <p>Amount : ${transaction.TransactionAmount}</p>
                            <p>Status : {transaction.TransactionStatus}</p>
                            </div>
                        ) : null
                        ))}
                    </div>
                </div>
            </div> 
        </div>
        
    )
}

export default DMZZone;