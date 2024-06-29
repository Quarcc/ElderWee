import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminNavbar from './component/admin/navbar/adminNavbar'
import AdminDashboard from './component/admin/Dashboard/adminDashboard'
import AdminBC from './component/admin/blockchain/adminBC'
import 'bootstrap/dist/css/bootstrap.min.css';
import './component/admin/css/Block.css';
import CubeContainer from './component/admin/blocks/CubeContainer';
// import Block from './component/admin/blocks/block';

function App(){
    return(
        <>
            <Routes>
                <Route path="" className="Block" element={<CubeContainer/>} />
                <Route path="adminNavbar" element={<AdminNavbar/>} />
                <Route path="adminDashboard" element={<AdminDashboard/>} />
                <Route path="adminBC" element={<AdminBC/>} />
            </Routes>
        </>
    );
}



export default App;