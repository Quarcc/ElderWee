import React, { useState, useEffect } from 'react';
import GeoSummary from './GeoSummary';
import '../css/adminNavbar.css';
import AdminNavBar from "../navbar/adminNavbar";
import FlaggedAccountsTable from './flaggedAccountsTable';
// import ActiveAccountsTable from './flaggedAccountsTable';
import '../css/geolocation.css';



function geoSummary() {
  const [activeAccounts] = useState([
    { id: '00645679', name: 'Jeremy Tay', contact: '91234567', lastIP: 'Singapore' },
    { id: '22374535', name: 'Jeren Goh', contact: '81234567', lastIP: 'Singapore' },
    { id: '27632543', name: 'Brandon Wee', contact: '61234567', lastIP: 'Singapore' },
    { id: '27642543', name: 'Brandon Wee', contact: '61234567', lastIP: 'Singapore' },
  ]);

  const [flaggedAccounts] = useState([
    { accNo: '00632543', name: 'Brandon Wee', contactNo: '81234567', lastLogin: 'The Russian Federation', reason: 'Sanctioned Country' },
    { accNo: '00633754', name: 'John Doe', contactNo: '12345678', lastLogin: 'Cambodia', reason: 'Suspicious Activities' },
    { accNo: '00738357', name: 'Brandon Tay', contactNo: '87654321', lastLogin: 'Philippines', reason: 'Suspicious Activities' },
    { accNo: '01332543', name: 'Brandon Tan', contactNo: '125-6-1424', lastLogin: 'North Korea', reason: 'Sanctioned Country' },
  ]);

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