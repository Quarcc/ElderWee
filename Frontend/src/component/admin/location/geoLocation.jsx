import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GeoSummary from './GeoSummary';
import '../css/adminNavbar.css';
import AdminNavBar from "../navbar/adminNavbar";
import FlaggedAccountsTable from './flaggedAccountsTable';
// import ActiveAccountsTable from './flaggedAccountsTable';
import '../css/geolocation.css';

const APIEndPoint = 'localhost:8000';

function geoSummary() {
  const [activeAccounts, setActiveAccounts] = useState([]);
  const [flaggedAccounts, setFlaggedAccounts] = useState([]);

  useEffect(async () => {
    // Fetching active accounts
    const activeAccRes = await fetch('http://localhost:8000/api/activeAccounts',{
      headers:{
        "Content-Type":"application/json",
      },
      method:"GET"
    });
    const activeAccData = await activeAccRes.json();

    setActiveAccounts(activeAccData);
    
    const flaggedAccRes = await fetch('http://localhost:8000/api/flaggedAccounts',{
      headers:{
        "Content-Type":"application/json",
      },
      method:"GET"
    });
    const flaggedAccData = await flaggedAccRes.json();

    setFlaggedAccounts(flaggedAccData)
    // Fetch flagged Accounts
    

      return ()=>{}
      
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
          <FlaggedAccountsTable flaggedAccountData={activeAccounts} />
        </div>
        {/* <div className="accountTables">
          <ActiveAccountsTable activeAccountData={activeAccounts} />
        </div> */}
      </div>
    </div>
  );
}

export default geoSummary;