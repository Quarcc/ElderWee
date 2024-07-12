import React from 'react';
import { Routes, Route } from 'react-router-dom';

import AdminNavbar from './component/admin/navbar/adminNavbar'
import AdminDashboard from './component/admin/Dashboard/adminDashboard'
import AdminBC from './component/admin/blockchain/adminBC'
import AdminDMZ from './component/admin/DMZ/DMZ'
import GeoSummary from './component/admin/location/geoLocation';
import PlaceHolder from './Placeholder';
import Login from './component/user/Login';
import SignUp from './component/user/Signup';

import './component/admin/css/donttouchme.css'
import 'bootstrap/dist/css/bootstrap.min.css';



function App(){
    return(
        <>
            <Routes>
                <Route path="/" element={<PlaceHolder/>} />
                <Route path="/adminNavbar" element={<AdminNavbar/>} />
                <Route path="/adminDashboard" element={<AdminDashboard/>} />
                <Route path="/adminBC" element={<AdminBC/>} />
                <Route path="/adminDMZ" element={<AdminDMZ/>} />
                <Route path="/adminGeo" element={<GeoSummary/>} />
                <Route path="/Login" element={<Login/>} />
                <Route path="/Signup" element={<SignUp/>} />

            </Routes>
        </>
    );
}



export default App;