import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ActiveAccountsSummary, FlaggedAccountsSummary } from './GeoSummary';
import '../css/adminNavbar.css';
import AdminNavBar from "../navbar/adminNavbar";
import FlaggedAccountsTable from './flaggedAccountsTable';
import ActiveAccountsTable from './activeAccounts';
import '../css/geolocation.css';
import {getAllAccounts,getAllUsers} from "../../../Api.js";

const APIEndPoint = 'localhost:8000';

function geoSummary() {
  
  const [accounts, setAccounts] = useState({
    flagged: [],
    active:[],
  });

  useEffect(()=>{
    const filterAccounts = async () =>{
      let data = await getAllAccounts();
      let userData = await getAllUsers();

      console.log(userData);

      let accountData = {
        flagged:[],
        active:[]
      }
      data.forEach((acc)=>{
        let user = {};
        for(let i = 0; i < userData.length; i++){
          let u = userData[i];
          if(u.UserID == acc.UserID){
            user["AccountNo"] = acc.AccountNo;
            user["Name"] = u.FullName;
            user["ContactNumber"] = u.PhoneNo;
            break;
          }
        }
        if(acc.Scammer){
          accountData.flagged.push(user);
        }
        else{
          accountData.active.push(user);
        }
      });
      console.log(accountData);
      setAccounts(accountData);
    }
    filterAccounts();
  },[]);

  return (
    <div className='container-fluid'>
      <div className='w-[25%]'> 
        <AdminNavBar/>
      </div>
      <div className="admingeo-container">
        <h1 className="title">
            Account
        </h1> 
        <div className="toprow-container">
          <div className='col-3 geo-row2'>
            <div className='row rowacc'>
              <ActiveAccountsSummary
                activeAccounts={accounts.active.length} 
              />
            </div>
            <div className='row rowacc'>
              <FlaggedAccountsSummary
                flaggedAccounts={accounts.flagged.length} 
              />
            </div>
          </div>
          <div className='col-9 geo-acc-table'>
            <ActiveAccountsTable activeAccountData={accounts.active} />
          </div>
        </div>
        <br />
        <div className="">
          <FlaggedAccountsTable flaggedAccountData={accounts.flagged} />
        </div>
      </div>
    
      </div>

  );
}

export default geoSummary;