import React from "react";
import '../css/adminDMZ.css';
import AdminNavbar from "../navbar/adminNavbar";

const adminDMZ = () => {
    return (
        <div className="container-fluid">
            <div className="adminNavbar">
                <AdminNavbar />
            </div>
            <div className="DMZ-bg">
                <div className="row DMZ-top-bg mb-5">
                    <h1>DMZ</h1>
                </div>
                <div className="row DMZ-bot-bg mt-5">
                    <h1>DMZ part 2</h1>
                </div>
            </div>
            
        </div>
    )
}

export default adminDMZ;