import React from "react";
import '../css/adminBC.css';
import AdminNavbar from "../navbar/adminNavbar";
import CubeContainer from "./blocks/CubeContainer";

const adminBC = () => {
    return (
        <div className="container-fluid">
            <div className="adminNavbar">
                <AdminNavbar />
            </div>
            
            <div className="BC-bg">
                <div className="BC-top-bg mb-5">
                    <h1 className="BC-header">Blockchain</h1>
                    <div className="BC-THREE-bg">
                        <CubeContainer />     
                    </div>
                </div>
                <div className="BC-bot-bg mt-5">
                    <h1 className="BC-transaction-header">Transaction History</h1>
                </div>     
            </div>
        </div>
    )
}

export default adminBC;