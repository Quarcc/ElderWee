import React, {useState, useEffect} from "react";
import AdminNavbar from "../navbar/adminNavbar";
import FlaggedAccountsTable from "./flaggedAccountsTable";
// import '../css/geoSummary.css';

const GeoSummary = ({ activeAccounts, flaggedAccounts }) => {
  return (
    <div className="geo-container-fluid">
        <AdminNavbar />
        <div className="geo-summaryContainer">
            <div className="geo-card">
                <h2>Active Accounts</h2>
                <h1>{activeAccounts.toLocaleString()}</h1>
                <h2>Flagged Accounts</h2>
                <h1>{flaggedAccounts.toLocaleString()}</h1>
            </div>
        </div>
    </div>
    
  );
};

export default GeoSummary;