import React from 'react';
import axios from 'axios';

// Define API endpoint and sanctioned countries list
const GeoAPIEndPoint = process.env.API_ENDPOINT;
const sanctionedCountries = ['Russia', 'Cuba', 'Iran', 'North Korea', 'Syria']; 

async function getAllAccounts() {
    try{
        const response = await axios.get(`https://${GeoAPIEndPoint}/getAll`)
        const allAccounts = response.data;

        const activeAccounts = allAccounts.filter(account => {
            return !sanctionedCountries.includes(account.LastIPLoginCountry);
        });

        return activeAccounts;
    } catch (error) {
        if (error.response){
            console.log('Error response: ' + error.response.data);
        } else if (error.request) {
            console.log('Error Request: ' + error.request);
        } else {
            console.log('Error Message: ' + error.message);
        }
    }
}

getAllAccounts().then(accounts => {
    console.log('Filtered Accounts', accounts)
})