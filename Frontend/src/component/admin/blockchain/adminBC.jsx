import React, { useState } from "react";
import '../css/adminBC.css';
import AdminNavbar from "../navbar/adminNavbar";
import CubeContainer from "../blocks/CubeContainer";

const adminBC = () => {
    // const [dataLength, setDataLength] = useState(5);
    // const blockData = Array.from({ length: dataLength }, (_, i) => ({
    //     url: `https://localhost:3000/block-${i}`
    // }));

    // const handleIncrease = () => setDataLength(prev => prev + 1);
    // const handleDecrease = () => setDataLength(prev => Math.max(prev - 1, 1));
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