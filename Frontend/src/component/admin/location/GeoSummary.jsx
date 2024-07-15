import React, {useState, useEffect} from "react";
import FlaggedAccountsTable from "./flaggedAccountsTable";

const GeoSummary = ({ activeAccounts, flaggedAccounts }) => {
  return (
    <div className="geo-container-fluid">
        <div className="geo-summaryContainer">
            <div className="geo-card">
                <h2>Active Accounts</h2>
                <h1>{activeAccounts}</h1>
                <h2>Flagged Accounts</h2>
                <h1>{flaggedAccounts}</h1>
            </div>
        </div>
    </div>
    
  );
};

export default GeoSummary;

    // <div className="">
    //   <div className=" p-4 bg-white rounded shadow">
    //       <div className="max-w-[50px] bg-black">Active Accounts</div>
    //       <h1 className="w-fit">{activeAccounts}</h1>
    //       <h2 className="w-fit">Flagged Accounts</h2>
    //       <h1 className="w-fit">{flaggedAccounts}</h1>
    //   </div>
    // </div>