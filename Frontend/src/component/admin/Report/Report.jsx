import React from "react";
import '../css/adminEnquiry.css';
import AdminNavbar from "../navbar/adminNavbar";
import {ReportManagement} from "./reportManagement"
import WordCloudComponent from "./wordCloud"

const adminReport = () => {
    return (
        <div className="container-fluid">
            <div className="adminNavbar">
                <AdminNavbar />
            </div>
            <div className="Enquiry-bg">
                <div className="row Enquiry-top-bg mb-5 p-3 Word-cloud">
                    <h1 style={{flex: '1 1 100%', fontSize: 40}}>Word Cloud</h1>
                    <WordCloudComponent />
                </div>
                <div className="row Enquiry-bot-bg mt-5 p-3 query-table">
                    <ReportManagement />
                </div>
                <br />
                <br />
            </div>
        </div>
    )
}

export default adminReport;