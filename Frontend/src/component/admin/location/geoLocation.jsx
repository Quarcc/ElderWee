import React, { useState, useEffect } from 'react';
import GeoSummary from './GeoSummary';
import AdminNavBar from "../navbar/adminNavbar";
import FlaggedAccountsTable from './flaggedAccountsTable';
import '../css/geolocation.css';
import '../css/geolocation.css';


function geoSummary() {
  const [activeAccounts] = useState([
    { id: '00645679', name: 'Jeremy Tay', contact: '91234567', lastIP: 'Singapore' },
    { id: '22374535', name: 'Jeren Goh', contact: '81234567', lastIP: 'Singapore' },
    { id: '27632543', name: 'Brandon Wee', contact: '61234567', lastIP: 'Singapore' },
  ]);

  const [flaggedAccounts] = useState([
    { accNo: '00632543', name: 'Brandon Wee', contactNo: '81234567', lastLogin: 'The Russian Federation', reason: 'Sanctioned Country' },
    { accNo: '00633754', name: 'John Doe', contactNo: '12345678', lastLogin: 'Cambodia', reason: 'Suspicious Activities' },
    { accNo: '00738357', name: 'Brandon Tay', contactNo: '87654321', lastLogin: 'Philippines', reason: 'Suspicious Activities' },
    { accNo: '01332543', name: 'Brandon Tan', contactNo: '125-6-1424', lastLogin: 'North Korea', reason: 'Sanctioned Country' },
  ]);

  return (
    <div className="app">
      <GeoSummary
        activeAccounts={activeAccounts.length} 
        flaggedAccounts={flaggedAccounts.length} 
      />
      <div className="accountTables">
        <flaggedAccountsTable flaggedAccountData={flaggedAccounts} />
      </div>
    </div>
  );
}

export default geoSummary;