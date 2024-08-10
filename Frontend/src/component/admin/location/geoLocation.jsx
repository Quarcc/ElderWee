import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ActiveAccountsSummary, FlaggedAccountsSummary } from "./GeoSummary";
import "../css/adminNavbar.css";
import AdminNavBar from "../navbar/adminNavbar";
import FlaggedAccountsTable from "./flaggedAccountsTable";
import ActiveAccountsTable from "./activeAccounts";
import "../css/geolocation.css";
import {
  getAllAccounts,
  getAllUsers,
  getLogs,
  updateCountryStatus,
} from "../../../Api.js";
import { useNavigate } from "react-router-dom";
import { Autocomplete, Button, ButtonGroup, TextField } from "@mui/material";

const APIEndPoint = "localhost:8000";

function geoSummary() {
  const [accounts, setAccounts] = useState({
    flagged: [],
    active: [],
  });

  const [countries] = React.useState([
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo (Congo-Brazzaville)",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czechia (Czech Republic)",
    "Democratic Republic of the Congo",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    'Eswatini (fmr. "Swaziland")',
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar (formerly Burma)",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Korea",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine State",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Korea",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States of America",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ]);

  const [bannedCountries, setBannedCountries] = React.useState([]);

  const navigate = useNavigate();

  const AllLogs = useRef([]);

  const getAccountLogsWithAccountNo = (accNo, logs) => {
    let accLogs = logs.filter((log) => {
      return accNo == log.AccountNo;
    });
    return accLogs.slice(0, 10);
  };

  useEffect(() => {
    const getLatestLog = (accNo, logs) => {
      let accLog = getAccountLogsWithAccountNo(accNo, logs);
      if (accLog.length < 1) {
        return [];
      }

      let latestLog = accLog[0];

      accLog.forEach((log) => {
        // console.log(log.LoginTime, latestLog.LoginTime);
        if (log.LoginTime > latestLog.LoginTime) {
          latestLog = log;
        }
      });

      return latestLog;
    };

    const filterAccounts = async () => {
      let data = await getAllAccounts();
      let userData = await getAllUsers();
      let logs = await getLogs();
      AllLogs.current = logs;
      let accountData = {
        flagged: [],
        active: [],
      };
      data.forEach((acc) => {
        let user = {};
        for (let i = 0; i < userData.length; i++) {
          let u = userData[i];
          if (u.UserID == acc.UserID) {
            let latestLog = getLatestLog(acc.AccountNo, logs);
            user["AccountNo"] = acc.AccountNo;
            user["Name"] = u.FullName;
            user["ContactNumber"] = u.PhoneNo;
            user["LastIPLogin"] = latestLog?.LastIPLoginCountry
              ? latestLog.LastIPLoginCountry
              : "NIL";
            user["Reason"] = acc.Scammer ? "Sanctioned Country" : "Unknown";
            break;
          }
        }
        if (acc.Scammer) {
          accountData.flagged.push(user);
        } else {
          accountData.active.push(user);
        }
      });
      setAccounts(accountData);
    };

    const getBannedCountries = async () => {
      try {
        let banList = await fetch("http://localhost:8000/api/countries/banned");
        let list = await banList.json();
        let bannedCountryNames = list.map((c) => c.CountryName);
        //console.log(bannedCountryNames);
        setBannedCountries(bannedCountryNames);
        return list;
      } catch (err) {
        console.log(err);
        return [];
      }
    };

    filterAccounts();
    getBannedCountries();
  }, []);

  const handleClickedFlaggedAccount = (e) => {
    let data = e.currentTarget.querySelectorAll("td");
    let accountNo = data[0].innerHTML;
    let logs = getAccountLogsWithAccountNo(accountNo, AllLogs.current);
    navigate("/UserLocation", {
      state: { AccountLogs: logs },
    });
  };

  const handleBanCountry = async (e) => {
    const countryName =
      e.target.parentNode.parentNode.parentNode.querySelector("span").innerHTML;
    await updateCountryStatus(countryName, 1);
    setBannedCountries((prevItems) => [...prevItems, countryName]);
    let newAccounts = JSON.parse(JSON.stringify(accounts));
    for (let i = 0; i < accounts.active.length; i++) {
      let acc = accounts.active[i];
      if (acc.LastIPLogin == countryName) {
        let result = await fetch(
          `http://localhost:8000/api/accounts/${acc.AccountNo}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              AccountStatus: 1,
              Scammer: 1,
            }),
          }
        );
        if (!result.ok) {
          alert(
            "Failed to update account ban status. Please unban and ban the country again."
          );
          break;
        }
        acc.Reason = "Sanctioned Country"
        newAccounts.flagged.push(acc);
        newAccounts.active = newAccounts.active.filter(
          (active) => active.AccountNo != acc.AccountNo
        );
      }
    }
    setAccounts(newAccounts);

    alert(`${countryName} added to banlist.`);
  };

  const handleUnbanCountry = async (e) => {
    const countryName =
      e.target.parentNode.parentNode.parentNode.querySelector("span").innerHTML;
    await updateCountryStatus(countryName, 0);
    let idx = bannedCountries.indexOf(countryName);
    setBannedCountries((prevItems) => [
      ...prevItems.slice(0, idx),
      ...prevItems.slice(idx + 1),
    ]);
    alert(`${countryName} removed from banlist.`);
  };

  return (
    <div className="container-fluid">
      <div className="w-[25%]">
        <AdminNavBar />
      </div>
      <div className="admingeo-container">
        <h1 className="title">Geotracking</h1>
        <div className="toprow-container">
          <div className="col-3 geo-row2">
            <div className="row rowacc">
              <ActiveAccountsSummary activeAccounts={accounts.active.length} />
            </div>
            <div className="row rowacc">
              <FlaggedAccountsSummary
                flaggedAccounts={accounts.flagged.length}
              />
            </div>
            <div className="country-ban-btn">
              <Autocomplete
                className="mt-4"
                options={countries}
                renderOption={(props, option) => {
                  return (
                    <div
                      {...props}
                      className="flex flex-row justify-between items-center w-full"
                      style={{ padding: "8px 16px" }} // Added padding for better spacing
                    >
                      <div
                        style={{ flexGrow: 1 }}
                        className={
                          bannedCountries.includes(option) ? "text-red-500" : ""
                        }
                      >
                        <span>{option}</span>
                      </div>
                      <div className="flex flex-row space-x-2">
                        <ButtonGroup>
                          {!bannedCountries.includes(option) && (
                            <Button
                              className="country-b"
                              size="small"
                              onClick={(e) => {
                                handleBanCountry(e);
                              }}
                            >
                              Ban
                            </Button>
                          )}
                          {bannedCountries.includes(option) && (
                            <Button
                              size="small"
                              onClick={(e) => {
                                handleUnbanCountry(e);
                              }}
                            >
                              Unban
                            </Button>
                          )}
                        </ButtonGroup>
                      </div>
                    </div>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Countries" />
                )}
              />
            </div>

          </div>
          <div className="col-9 geo-acc-table">
            <ActiveAccountsTable
              activeAccountData={accounts.active}
              handleClickedFlaggedAccount={handleClickedFlaggedAccount}
            />
          </div>
        </div>
        <br />
        <div className="geo-flagacc-table">
          <FlaggedAccountsTable
            flaggedAccountData={accounts.flagged}
            handleClickedFlaggedAccount={handleClickedFlaggedAccount}
          />
        </div>
      </div>
      <br />
    </div>
  );
}

export default geoSummary;