import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GeoSummary from './GeoSummary';
import '../css/adminNavbar.css';
import AdminNavBar from "../navbar/adminNavbar";
import FlaggedAccountsTable from './flaggedAccountsTable';
import ActiveAccountsTable from './activeAccounts';
import '../css/geolocation.css';
import {getAllAccounts} from "../../../Api.js";

const APIEndPoint = 'localhost:8000';

function geoSummary() {
  
  const [accounts, setAccounts] = useState({
    flagged: [],
    active:[],
  })

  useEffect(()=>{
    const filterAccounts = async () =>{
      let data = await getAllAccounts();
      console.log(data);
      let accountData = {
        flagged:[],
        active:[]
      }
      data.forEach((acc)=>{
        if(acc.Scammer){
          accountData.flagged.push(acc);
        }
        else{
          accountData.active.push(acc);
        }
      });
      console.log(accountData);
      setAccounts(accountData);
    }
    filterAccounts();
  },[]);

  return (
    <div className=''>
      <div className='w-[25%]'> 
        <AdminNavBar/>
      </div>
      <div className="container">
        <h1 className="title">
            Account
        </h1> 
        <div className="geoSummary">
          <div className='flex flex-row'>
            <GeoSummary
              activeAccounts={accounts.active.length} 
              flaggedAccounts={accounts.flagged.length} 
            />
            <ActiveAccountsTable activeAccountData={accounts.active} />
          </div>

        <div className="accountTables">
          <FlaggedAccountsTable flaggedAccountData={accounts.flagged} />
        </div>
      </div>
    </div>
      </div>

  );
}

export default geoSummary;