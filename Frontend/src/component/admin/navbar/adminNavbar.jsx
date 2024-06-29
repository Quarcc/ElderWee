import React from "react";
import '../css/adminNavbar.css';
import { NavbarData } from "./NavbarData";

import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const AdminNavbar = () => {
    return (
        <div className="Navbar">
            <div className="account-profile">
                <div className="profile-icon">
                    <AccountCircleIcon fontSize="large" />
                </div>
                <div className="profile-title">
                    Profile     {/* Profile retrive from database */}
                </div>
            </div>
            <ul className="Navbar-list">
                {NavbarData.map((val, key) => (
                    <li key={key} className="Navbar-row" id={window.location.pathname == val.link ? "active" : ""} onClick={() => {window.location.pathname = val.link}}>
                        <div id="icon">
                            {val.icon}
                        </div>
                        <div id="title">
                            {val.title}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
};

export default AdminNavbar