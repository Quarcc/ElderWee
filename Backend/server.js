// Import dependencies
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

// Database
const elderwee = require('./config/DBConnection');
const db = require('./config/db');

const Transaction = require('./models/Transaction');
const Location = require('./models/Geolocation');
const Account = require('./models/Account');

// Blockchain module
const {Block, Blockchain} = require('./blockchain/blockchain');

const app = express();

let port = 8000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:3000",  //specify domains that can call your API
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

elderwee.setUpDB(false); // true will drop all tables and create again, false will create new tables without losing old ones, true will also delete all existing data

const options = {
    host: db.host,
    port:db.port,
    user:db.username,
    password:db.password,
    database:db.database
    }
    const sessionStore = new MySQLStore(options);
    app.use(session({
    key:'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized:false
}));

let a = new Blockchain();

console.log('The blockchain mining in progres..')
a.addNewBlock(
    new Block(1, "02/02/2024", {
        sender: "test",
        receipient: "test2",
        amount: 100.00,
    })
);

a.addNewBlock(
    new Block(2, "03/02/2024", {
        sender: "test3",
        receipient: "test4",
        amount: 1000.00,
    })
);

console.log(JSON.stringify(a, null, 4));

app.get('/api/transactions', async (req, res) => {
    const transaction = await Transaction.findAll();    
    return res.status(200).send(JSON.stringify(transaction));
})

// API endpoint to get active accounts
app.get('/api/activeAccounts', async(req, res) => {
    try{
        const accounts = await Account.findAll({
            where: { AccountStatus: false }
        });
        res.json(accounts);
    }  catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get flagged accounts
app.get('/api/flaggedAccounts', async (req, res) => {
    try {
        const accounts = await Account.findAll({
            where: { Scammer: true }
        });
        res.json(accounts);
    }   catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Accounts dummy data 
// const AccdummyData = [
//     { AccountNo: 'ACC001', Balance: 1000.50, DateOpened: '2022-01-15', AccountStatus: false, Scammer: false },
//     { AccountNo: 'ACC002', Balance: 200.75, DateOpened: '2022-02-20', AccountStatus: false, Scammer: true },
//     { AccountNo: 'ACC003', Balance: 1500.00, DateOpened: '2022-03-05', AccountStatus: true, Scammer: false },
//     { AccountNo: 'ACC004', Balance: 500.25, DateOpened: '2022-04-10', AccountStatus: false, Scammer: false },
//     { AccountNo: 'ACC005', Balance: 300.60, DateOpened: '2022-05-15', AccountStatus: true, Scammer: true },
//     { AccountNo: 'ACC006', Balance: 750.45, DateOpened: '2022-06-20', AccountStatus: false, Scammer: false },
//     { AccountNo: 'ACC007', Balance: 50.30, DateOpened: '2022-07-25', AccountStatus: true, Scammer: false },
//     { AccountNo: 'ACC008', Balance: 1100.80, DateOpened: '2022-08-30', AccountStatus: false, Scammer: true },
//     { AccountNo: 'ACC009', Balance: 650.00, DateOpened: '2022-09-05', AccountStatus: false, Scammer: false },
//     { AccountNo: 'ACC010', Balance: 400.95, DateOpened: '2022-10-10', AccountStatus: true, Scammer: true },
//     { AccountNo: 'ACC011', Balance: 1200.75, DateOpened: '2022-11-15', AccountStatus: false, Scammer: false },
//     { AccountNo: 'ACC012', Balance: 800.20, DateOpened: '2022-12-20', AccountStatus: false, Scammer: true },
//     { AccountNo: 'ACC013', Balance: 300.15, DateOpened: '2023-01-25', AccountStatus: true, Scammer: false },
//     { AccountNo: 'ACC014', Balance: 450.90, DateOpened: '2023-02-28', AccountStatus: false, Scammer: false },
//     { AccountNo: 'ACC015', Balance: 100.00, DateOpened: '2023-03-15', AccountStatus: true, Scammer: true },
//     { AccountNo: 'ACC016', Balance: 550.25, DateOpened: '2023-04-20', AccountStatus: false, Scammer: false },
//     { AccountNo: 'ACC017', Balance: 650.80, DateOpened: '2023-05-25', AccountStatus: false, Scammer: true },
//     { AccountNo: 'ACC018', Balance: 250.35, DateOpened: '2023-06-30', AccountStatus: true, Scammer: false },
//     { AccountNo: 'ACC019', Balance: 950.45, DateOpened: '2023-07-05', AccountStatus: false, Scammer: false },
//     { AccountNo: 'ACC020', Balance: 700.60, DateOpened: '2023-08-10', AccountStatus: true, Scammer: true }
// ];

// async function AccinsertDummyData() {
//     for (const data of AccdummyData) {
//         await Account.create(data);
//     }
//     console.log('20 dummy data entries have been inserted');
// }

// AccinsertDummyData();



// Geolocation dummy data
// const GeodummyData = [
//     { LocationID: 1, Latitude: 37.7749, Longitude: -122.4194, LastIPLoginCountry: 'United States' },
//     { LocationID: 2, Latitude: 51.5074, Longitude: -0.1278, LastIPLoginCountry: 'United Kingdom' },
//     { LocationID: 3, Latitude: 48.8566, Longitude: 2.3522, LastIPLoginCountry: 'France' },
//     { LocationID: 4, Latitude: 35.6895, Longitude: 139.6917, LastIPLoginCountry: 'Japan' },
//     { LocationID: 5, Latitude: -33.8688, Longitude: 151.2093, LastIPLoginCountry: 'Australia' },
//     { LocationID: 6, Latitude: 52.5200, Longitude: 13.4050, LastIPLoginCountry: 'Germany' },
//     { LocationID: 7, Latitude: 40.7128, Longitude: -74.0060, LastIPLoginCountry: 'United States' },
//     { LocationID: 8, Latitude: 55.7558, Longitude: 37.6173, LastIPLoginCountry: 'Russia' },
//     { LocationID: 9, Latitude: 34.0522, Longitude: -118.2437, LastIPLoginCountry: 'United States' },
//     { LocationID: 10, Latitude: -23.5505, Longitude: -46.6333, LastIPLoginCountry: 'Brazil' },
//     { LocationID: 11, Latitude: 19.4326, Longitude: -99.1332, LastIPLoginCountry: 'Mexico' },
//     { LocationID: 12, Latitude: 28.6139, Longitude: 77.2090, LastIPLoginCountry: 'India' },
//     { LocationID: 13, Latitude: 1.3521, Longitude: 103.8198, LastIPLoginCountry: 'Singapore' },
//     { LocationID: 14, Latitude: -26.2041, Longitude: 28.0473, LastIPLoginCountry: 'South Africa' },
//     { LocationID: 15, Latitude: 39.9042, Longitude: 116.4074, LastIPLoginCountry: 'China' },
//     { LocationID: 16, Latitude: 41.9028, Longitude: 12.4964, LastIPLoginCountry: 'Italy' },
//     { LocationID: 17, Latitude: 35.6762, Longitude: 139.6503, LastIPLoginCountry: 'Japan' },
//     { LocationID: 18, Latitude: 40.4168, Longitude: -3.7038, LastIPLoginCountry: 'Spain' },
//     { LocationID: 19, Latitude: -34.6037, Longitude: -58.3816, LastIPLoginCountry: 'Argentina' },
//     { LocationID: 20, Latitude: 31.2304, Longitude: 121.4737, LastIPLoginCountry: 'China' }
// ];

// async function GeoinsertDummyData() {
//     for (const data of GeodummyData) {
//         await Location.create(data);
//     }
//     console.log('20 dummy data entries have been inserted');
// }

// GeoinsertDummyData();



// Last line of code
app.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
});