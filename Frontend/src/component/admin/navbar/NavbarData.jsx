import React from "react";
import '../css/adminNavbar.css';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PaidIcon from '@mui/icons-material/Paid';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FlagIcon from '@mui/icons-material/Flag';
import LogoutIcon from '@mui/icons-material/Logout';

export const NavbarData = [
    {
        title: "Dashboard",
        icon: <DashboardIcon />,
        link: "/adminDashboard"
    },
    {
        title: "Transaction",
        icon: <PaidIcon />,
        link: "/adminNavbar"
    },
    {
        title: "Blockchain",
        icon: <CurrencyBitcoinIcon />,
        link: "/adminBC"
    },
    {
        title: "Demilitarized Zone",
        icon: <SwapHorizIcon />,
        link: "/adminDMZ"
    },
    {
        title: "Account",
        icon: <AccountCircleIcon />,
        link: "/adminAccountr"
    },
    {
        title: "Report",
        icon: <FeedbackIcon />,
        link: "/adminReport"
    },
    {
        title: "Geotracking",
        icon: <LocationOnIcon />,
        link: "/adminGeotracking"
    },
    {
        title: "Flagged Accounts",
        icon: <FlagIcon />,
        link: "/adminFlag"
    },
    {
        title: "Logout",
        icon: <LogoutIcon />,
        link: "/logout"
    },

]
