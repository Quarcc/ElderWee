import React from "react";
import io from 'socket.io-client'
import AdminNavbar from "../navbar/adminNavbar";
import DMZCard from "./card/dmzCard";
import DMZZone from "./zone/dmzZone";
import DMZTable from "./table/dmzTable";

import '../css/adminDMZ.css';

const adminDMZ = () => {
    return (
        <div className="container-fluid">
            <div className="adminNavbar">
                <AdminNavbar />
            </div>
            <div className="DMZ-bg">
                <DMZCard />
                <DMZZone />
                <div className="ms-5 me-5 mt-4 DMZ-table-bg">
                    <div className="p-3">
                        <h1 className="DMZ-header" style={{'font-weight': '600'}}>Transaction History</h1>
                        <DMZTable /> 
                    </div>  
                </div>
            </div>
            
        </div>
    )
}

export default adminDMZ;