import React, { useEffect, useState } from "react";
import '../css/adminBC.css';

import AdminNavbar from "../navbar/adminNavbar";
import CubeContainer from "./blocks/CubeContainer";
import TransactionTable from "./transactionTable/transactionTable";

import Preload from "../../preloader/preloader";

const AdminBC = () => {
    // const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     // Simulate a data fetch or any loading operation
    //     setTimeout(() => {
    //         setLoading(false);
    //     }, 500); // Adjust the timeout as needed to simulate your loading time
    // }, []);

    // if (loading) {
    //     return <Preload />;
    // }

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
                <div className="BC-bot-bg mt-5">
                    <h1 className="BC-transaction-header">Transaction Details</h1>
                    <TransactionTable className="BC-transaction-table" />
                </div>     
            </div>
        </div>
    );
}

export default AdminBC;