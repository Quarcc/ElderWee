import React from "react";
import '../css/adminDashboard.css';
import AdminNavbar from "../navbar/adminNavbar";


function AdminDashboard() {
    return (
        <div className="container-fluid">
            <div className="adminNavbar">
                <AdminNavbar />
            </div>

            <div className="main-dashboard">
                <div className="title">
                    Dashboard
                </div>
            </div>
        </div>
    )
};

export default AdminDashboard