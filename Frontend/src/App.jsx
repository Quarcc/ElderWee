import React from 'react';
import { Routes, Route, Link} from 'react-router-dom';

import AdminNavbar from './component/admin/navbar/adminNavbar';
import AdminDashboard from './component/admin/Dashboard/adminDashboard';
import AdminAccount from './component/admin/Account/Account';
import AdminBC from './component/admin/blockchain/adminBC';
import AdminBCdetails from './component/admin/blockchain/adminBCdetailed';
import AdminBCtrace from './component/admin/blockchain/adminBCtrace';
import AdminDMZ from './component/admin/DMZ/DMZ';
import AdminReport from './component/admin/Report/Report'
import GeoSummary from './component/admin/location/geoLocation';
import PlaceHolder from './Placeholder';
import Login from './component/user/Login';
import SignUp from './component/user/Signup';
import UserLocation from './component/admin/location/userLocation';
import Home from './component/user/landing-page/Home';
import ResetPassword from './component/user/ResetPassword';
import ForgotPassword from './component/user/ForgotPassword';
import ProfilePage from './component/user/Profile';
import TransactionTest from './component/user/transactionTest'
import LandingPage from './component/user/landing-page/LandingPage';
import TopUp from './component/user/TopUp';
import Card from './component/user/Card';
import TransferFund from './component/user/TransferFund';
import TransactionHistory from './component/user/TransactionHistory';
import MoneyFlowChart from './component/user/MoneyFlowChart';

import './component/admin/css/donttouchme.css'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

    return (
        <>
            <Routes>
                <Route path="/" element={<PlaceHolder />} />
                <Route path="/adminNavbar" element={<AdminNavbar />} />
                <Route path="/adminDashboard" element={<AdminDashboard />} />
                <Route path="/adminAccount" element={<AdminAccount />} />
                <Route path="/adminBC" element={<AdminBC />} />
                <Route path="/admin/transaction/details/id/:transactionID" element={<AdminBCdetails />} />
                <Route path="/admin/transaction/trace/id/:transactionID" element={<AdminBCtrace />} />
                <Route path="/adminDMZ" element={<AdminDMZ />} />
                <Route path='/adminReport' element={<AdminReport /> } />
                <Route path="/adminGeo" element={<GeoSummary />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/UserLocation" element={<UserLocation />} />
                <Route path="/home" element={<Home />} />
                <Route path="/forgot" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path='/transactionTest' element={<TransactionTest />} />
                <Route path='/landing' element={<LandingPage />} />
                <Route path='/topup' element={<TopUp />} />
                <Route path='/card' element={<Card />} />
                <Route path='/transfer' element={<TransferFund />} />
                <Route path='/history' element={<TransactionHistory />} />
                <Route path='/flowchart' element={<MoneyFlowChart />} />

            </Routes>
        </>
    );
}



export default App;
