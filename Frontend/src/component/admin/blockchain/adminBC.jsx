import React from "react";
import '../css/adminBC.css';
import AdminNavbar from "../navbar/adminNavbar";
import CubeContainer from "../blocks/CubeContainer";

const adminBC = () => {
    return (
        <div className="container-fluid">
            <div className="adminNavbar">
                <AdminNavbar />
            </div>
            
            <div className="main-bc">
                <CubeContainer />
            </div>
        </div>
    )
}

export default adminBC;