import React from "react";
import '../css/adminDashboard.css';
import AdminNavbar from "../navbar/adminNavbar";
import { KPIBox } from "./adminKPI";
import { LineChart } from "./adminLineChart/adminLine";
import { PieChart } from "./adminPieChart/adminPie"
import { BarChart } from "./adminBarChart/adminBar"
import { UserTable } from "./adminTable/userTable"
import { AccountTable } from "./adminTable/accountTable"


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
                        <LineChart />
                    </div>
                    <div className="line-1">
                        <h2 style={{ paddingLeft: 30, paddingBottom: 10, paddingTop: 10 }}>Customer Queries</h2>
                        <PieChart />
                    </div>
                </div>
                <br />
                <div id="graph-row-2">
                    <div className="line-2">
                    <h2 style={{ paddingLeft: 30, paddingBottom: 10, paddingTop: 10 }}>Transaction Made</h2>
                        <BarChart />
                    </div>
                </div>
                <br />
                <div id="graph-row-3">
                    <AccountTable />
                </div>
                <br />
                <div id="graph-row-3">
                    <UserTable />
                </div>
                <br />
            </div>
        </div>
    )
};

export default AdminDashboard