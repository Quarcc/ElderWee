import React from "react";
import { UserManagement } from "./userManagement"
import { AccountManagement } from "./accountManagement"
import '../css/adminAccount.css';
import AdminNavbar from "../navbar/adminNavbar";

const adminAccount = () => {
    return (
        <div className="container-fluid">
            <div className="adminNavbar">
                <AdminNavbar />
            </div>
            <div className="Account-bg">
                <div className="row Account-top-bg mb-5 p-3">
                    <UserManagement />

                </div>
                <div className="row Account-bot-bg mt-5 p-3">
                    <AccountManagement />
                </div>
                <br />
                <br />
            </div>
        </div>
    )
}

export default adminAccount;