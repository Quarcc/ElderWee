import React from "react";

import '../css/adminBC.css';

import AdminNavbar from "../navbar/adminNavbar";
import CubeContainer from "./blocks/CubeContainer";
import TransactionTrace from "./transactionTracing/transactionTracing";

const adminBCtrace = () => {

    return (
        <div className="container-fluid">
            <div className="adminNavbar">
                <AdminNavbar />
            </div>
            
            <div className="BC-bg">
                <div className="BC-top-bg mb-5">
                    <h1 className="BC-header">Transaction History</h1>
                    <p className="BC-subheader">*Use your arrow keys to navigate the blockchain</p>
                    <div className="BC-THREE-bg">
                        <CubeContainer />
                    </div>
                </div>
                <div className="BC-bot-bg mt-5 mb-5">
                    <h1 className="BC-transaction-header">Tracing Transaction Origin</h1>
                    <TransactionTrace />
                </div>     
            </div>
        </div>
    )
}

export default adminBCtrace;