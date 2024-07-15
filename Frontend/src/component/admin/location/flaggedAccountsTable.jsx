import React from 'react';
import FlaggedAccountRow from './flaggedAccountsRow';

const FlaggedAccountsTable = ({ flaggedAccountData }) => {

  
  
  return (
    <div className="geo-container overflow-y-scroll">
      <h2>Flagged Accounts</h2>
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
          {flaggedAccountData.map(account => (
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
};

// const ActiveAccountsTable = ({ activeAccountData }) => {
//   return (
//     <div className="geo-container">
//       <h2>Flagged Accounts</h2>
//       <table className="geo-table">
//         <thead>
//           <tr>
//             <th className="geo-th">Account No</th>
//             <th className="geo-th">Name</th>
//             <th className="geo-th">Contact Number</th>
//             <th className="geo-th">Last IP Login</th>
//             <th className="geo-th">Reason</th>
//           </tr>
//         </thead>
//         <tbody>
//           {activeAccountData.map(account => (
//             <ActiveAccountRow 
//               key={account.accNo} 
//               accNo={account.accNo} 
//               name={account.name} 
//               contactNo={account.contactNo} 
//               lastLogin={account.lastLogin} 
//               reason={account.reason} 
//             />
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };



export default FlaggedAccountsTable;
