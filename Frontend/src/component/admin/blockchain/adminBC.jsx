import React, {useState, useEffect} from "react";
import axios from 'axios';

import '../css/adminBC.css';

import AdminNavbar from "../navbar/adminNavbar";
import CubeContainer from "./blocks/CubeContainer";

const APIEndPoint = 'localhost:8000';

async function allTransactions(){
    await axios.get(`http://${APIEndPoint}/api/transactions`).then(
        res => {

            return res.data
        }
    ).catch(
        error=>{
            // anything outside the status code 2xx range
            if(error.response){
                console.log('Error Response: ' + error.repsonse);
            }
            // Request made with no response
            else if(error.request){
                console.log('Error Request: ' + error.request);
            }
            // Any other error
            else{
                console.log('Error Message: ' + error.message);
            }
        }
    )
}

const adminBC = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const getTransaction = async () => {
            const data = await allTransactions();
            setTransactions(data);
        };

        getTransaction();
    }, []);

    return (
        <div className="container-fluid">
            <div className="adminNavbar">
                <AdminNavbar />
            </div>
            
            <div className="BC-bg">
                <div className="BC-top-bg mb-5">
                    <h1 className="BC-header">Transaction History</h1>
                    <div className="BC-THREE-bg">
                        <CubeContainer />     
                    </div>
                </div>
                <div className="BC-bot-bg mt-5">
                    <h1 className="BC-transaction-header">Transaction Details</h1>
                    <pre>{JSON.stringify(transactions, null, 2)}</pre>
                </div>     
            </div>
        </div>
    )
}

export default adminBC;