import React from "react";
import '../css/adminDashboard.css';
import AdminNavbar from "../navbar/adminNavbar";
import { LineGraph } from "./adminLine";
import { KPIBox } from "./adminKPI";


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
                <div className="KPI">
                    <div className="KPI-box1">
                        <KPIBox />
                    </div>
                </div>
                <div className="line">
                    <LineGraph />
                </div>
            </div>
        </div>
    )
};

export default AdminDashboard