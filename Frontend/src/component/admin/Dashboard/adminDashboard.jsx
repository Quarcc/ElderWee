import React from "react";
import '../css/adminDashboard.css';
import AdminNavbar from "../navbar/adminNavbar";
import { KPIBox } from "./adminKPI";
import { LineGraph } from "./adminLine";
import { PieChart } from "./adminPie"


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
                <div id="graph-row-1">
                    <div className="line">
                        <h2 style={{ marginLeft: 30, marginBottom: 10, marginTop: 10 }}>Accounts Created</h2>
                        <LineGraph />
                    </div>
                    <div className="line-1">
                        <h2 style={{ marginLeft: 30, marginBottom: 10, marginTop: 10 }}>Customer Queries</h2>
                        <PieChart />
                    </div>
                </div>
                <br />
                <div id="graph-row-2">
                    <div className="line-2">
                        <LineGraph />
                    </div>
                </div>
            </div>
        </div>
    )
};

export default AdminDashboard