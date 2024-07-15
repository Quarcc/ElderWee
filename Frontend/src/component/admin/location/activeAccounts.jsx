import React from 'react';
import axios from 'axios';
import FlaggedAccountRow from './flaggedAccountsRow';

// Define API endpoint and sanctioned countries list
const GeoAPIEndPoint = process.env.API_ENDPOINT;
const sanctionedCountries = ['Russia', 'Cuba', 'Iran', 'North Korea', 'Syria']; 

const ActiveAccountsTable = ({activeAccountData}) =>{
    return (
        <div className="geo-container overflow-y-scroll">
        <h2>Active Accounts</h2>
        <table className="geo-table">
            <thead>
            <tr>
                <th className="geo-th">Account No</th>
                <th className="geo-th">UserID</th>
                <th className="geo-th">Contact Number</th>
                <th className="geo-th">Last IP Login</th>
                <th className="geo-th">Reason</th>
            </tr>
            </thead>
            <tbody className="">
            {activeAccountData.map(account => (
                <FlaggedAccountRow 
                key={account.AccountNo} 
                accNo={account.AccountNo} 
                userID={account.UserID} 
                //contactNo={account.contactNo} 
                //lastLogin={account.lastLogin} 
                //reason={account.reason} 
                />
            ))}
            </tbody>
        </table>

        </div>
  );
}

export default ActiveAccountsTable;