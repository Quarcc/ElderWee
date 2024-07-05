import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GeoSummary from './GeoSummary';
import '../css/adminNavbar.css';
import AdminNavBar from "../navbar/adminNavbar";
import FlaggedAccountsTable from './flaggedAccountsTable';
// import ActiveAccountsTable from './flaggedAccountsTable';
import '../css/geolocation.css';



function geoSummary() {
  const [activeAccounts, setActiveAccounts] = useState([]);
  const [flaggedAccounts, setFlaggedAccounts] = useState([]);

  useEffect(() => {
    // Fetching active accounts ------- AUTISM>?????????? PORT SET TO 8000 btw - Brandon
    axios.get('http://localhost:3001/api/activeAccounts')
      .then(response => {
        setActiveAccounts(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the active accounts', error);
      });

    // Fetch flagged Accounts
    axios.get('http://localhost:3001/api/flaggedAccounts')
      .then(response => {
        setFlaggedAccounts(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the flagged accounts!', error);
      });
      
  }, []);

  return (
    <div>
      <div> 
        <AdminNavBar/>
      </div>
      <div className="main-dashboard">
                <div className="title">
                    Account
                </div>
      </div>
      <div className="geoSummary">
        <GeoSummary
          activeAccounts={activeAccounts.length} 
          flaggedAccounts={flaggedAccounts.length} 
        />
        <div className="accountTables">
          <FlaggedAccountsTable flaggedAccountData={flaggedAccounts} />
        </div>
        {/* <div className="accountTables">
          <ActiveAccountsTable activeAccountData={activeAccounts} />
        </div> */}
      </div>
    </div>
  );
}

export default geoSummary;