import React from "react";
import '../css/adminDMZ.css';
import io from 'socket.io-client'
import AdminNavbar from "../navbar/adminNavbar";
import DMZCard from "./card/dmzCard";
import DMZZone from "./zone/dmzZone";

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
            </div>
            
        </div>
    )
}

export default adminDMZ;