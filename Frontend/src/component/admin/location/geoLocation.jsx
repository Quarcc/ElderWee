import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ActiveAccountsSummary, FlaggedAccountsSummary } from "./GeoSummary";
import "../css/adminNavbar.css";
import AdminNavBar from "../navbar/adminNavbar";
import FlaggedAccountsTable from "./flaggedAccountsTable";
import ActiveAccountsTable from "./activeAccounts";
import "../css/geolocation.css";
import { getAllAccounts, getAllUsers, getLogs } from "../../../Api.js";
import { useNavigate } from "react-router-dom";

const APIEndPoint = "localhost:8000";

function geoSummary() {
  const [accounts, setAccounts] = useState({
    flagged: [],
    active: [],
  });

  const navigate = useNavigate();

  const AllLogs = useRef([]);

  const getAccountLogsWithAccountNo = (accNo, logs) =>{
    let accLogs = logs.filter((log) => {
        return accNo == JSON.parse(log.AccountNo);
      });
      return accLogs;
  }

  useEffect(() => {
    const getLatestLog = (accNo, logs) => {
      let accLog = getAccountLogsWithAccountNo(accNo,logs);

      if (accLog.length < 1) {
        return [];
      }

      let latestLog = accLog[0];

      accLog.forEach((log) => {
        if (JSON.parse(log.LoginTime) > JSON.parse(latestLog.LoginTime)) {
          latestLog = log;
        }
      });

      return latestLog;
    };

    const filterAccounts = async () => {
      let data = await getAllAccounts();
      let userData = await getAllUsers();
      let logs = await getLogs();
      AllLogs.current = logs;
      let accountData = {
        flagged: [],
        active: [],
      };
      data.forEach((acc) => {
        let user = {};
        for (let i = 0; i < userData.length; i++) {
          let u = userData[i];
          if (u.UserID == acc.UserID) {
            let latestLog = getLatestLog(acc.AccountNo, logs);
            user["AccountNo"] = acc.AccountNo;
            user["Name"] = u.FullName;
            user["ContactNumber"] = u.PhoneNo;
            user["LastIPLogin"] = latestLog?.LastIPLoginCountry
              ? latestLog.LastIPLoginCountry
              : "NIL";
            break;
          }
        }
        if (acc.Scammer) {
          accountData.flagged.push(user);
        } else {
          accountData.active.push(user);
        }
      });
      setAccounts(accountData);
    };
    filterAccounts();
  }, []);

  const handleClickedFlaggedAccount = (e) =>{
    let data = e.currentTarget.querySelectorAll("td");
    let accountNo = data[0].innerHTML;
    let logs = getAccountLogsWithAccountNo(accountNo,AllLogs.current);
    navigate("/UserLocation",{
      state: {AccountLogs: logs}
    });
  }

  return (
    <div className="container-fluid">
      <div className="w-[25%]">
        <AdminNavBar />
      </div>
      <div className="admingeo-container">
        <h1 className="title">Account</h1>
        <div className="toprow-container">
          <div className="col-3 geo-row2">
            <div className="row rowacc">
              <ActiveAccountsSummary activeAccounts={accounts.active.length} />
            </div>
            <div className="row rowacc">
              <FlaggedAccountsSummary
                flaggedAccounts={accounts.flagged.length}
              />
            </div>
          </div>
          <div className="col-9 geo-acc-table">
            <ActiveAccountsTable activeAccountData={accounts.active} />
          </div>
        </div>
        <br />
        <div className="">
          <FlaggedAccountsTable flaggedAccountData={accounts.flagged} handleClickedFlaggedAccount={handleClickedFlaggedAccount}/>
        </div>
      </div>
    </div>
  );
}

export default geoSummary;
