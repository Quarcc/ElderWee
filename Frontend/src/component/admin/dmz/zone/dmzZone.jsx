import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

import Button from '@mui/material/Button';

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
        <div className="d-flex ms-5 me-5 mt-4">
            <div className="col me-2 mainZoneBox">
                <h2 className="mt-2" style={{'font-weight': '600', postion: 'sticky'}}>Demilitarized Zone</h2>
                <div className="dmz-container flex-wrap d-flex justify-content-start align-items-start">
                    {transactions.map((transaction) => (
                        <Button style={{ padding: 0, margin: 0, textTransform: 'none', color: 'black', textAlign: 'left', textDecoration: 'none'}}>
                            <div key={transaction.id} className="dmz-box">
                                <p>ID : {transaction.id}</p>
                                <p>Amount : ${transaction.amount}</p>
                                <p>Reason : {transaction.status}</p>
                            </div>
                        </Button>
                    ))}
                </div>
            </div>
            <div className="col ms-2 mainZoneBox">
                <h2 className="mt-2" style={{'font-weight': '600', postion: 'sticky'}}>Frozen Funds</h2>
                <div className="dmz-container-frozen flex-wrap d-flex justify-content-start align-items-start">
                    {funds.map((transaction) => (
                        transaction.TransactionStatus === "Pending" ? (
                            <Button style={{ padding: 0, margin: 0, textTransform: 'none', color: 'black', textAlign: 'left', textDecoration: 'none'}}>
                                <div key={transaction.TransactionID} className="dmz-box-frozen">
                                    <p>ID : {transaction.TransactionID}</p>
                                    <p>Amount : ${transaction.TransactionAmount}</p>
                                    <p>Reason : {transaction.TransactionStatus}</p>
                                </div> 
                            </Button>
                        ) : null
                    ))}
                </div>
            </div>
        </div>
    )
}

export default DMZZone;