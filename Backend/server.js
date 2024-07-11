// Import dependencies
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

// Database
const elderwee = require('./config/DBConnection');
const db = require('./config/db');
const { Op } = require('sequelize');

const User = require('./models/User');
const Account = require('./models/Account');
const Transaction = require('./models/Transaction');
const Location = require('./models/Geolocation');

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

let Bc = new Blockchain();

const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = date.getDate();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

const initBc = async () => {
    try {
        const transactions = await Transaction.findAll();
        let i = 1;
        transactions.forEach(transaction => {
            const blockNumber = i.toString().padStart(6, '0');
            console.log(i)
            const formattedDate = formatDate(transaction.TransactionDate);
            Bc.addNewBlock(
                new Block (blockNumber, formattedDate, {
                    TransactionID: transaction.TransactionID,
                    TransactionDate: transaction.TransactionDate,
                    TransactionAmount: transaction.TransactionAmount,
                    TransactionStatus: transaction.TransactionStatus,
                    TransactionType: transaction.TransactionType,
                    TransactionDesc: transaction.TransactionDesc,
                    ReceiverID: transaction.ReceiverID,
                    ReceiverAccountNo: transaction.ReceiverAccountNo,
                    SenderID: transaction.SenderID,
                    SenderAccountNo: transaction.SenderAccountNo
                })
            );
            i++;
        })
    } catch (err) {
        console.log(err);
    }
    console.log(JSON.stringify(Bc, null, 2));
}

initBc();

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

app.get('/api/Blockchain', async (req, res) => {
    res.status(200).send(Bc)
})

app.get('/api/allTransactions', async (req, res) => {
    try {
        const transactions = await Transaction.findAll();
        res.json(transactions);
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/users/:userID', async (req, res) => {
    const { userID } = req.params
    try {
        const user = await User.findOne({ where: {UserID: userID }});
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' } );
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/userCount', async (req, res) => {
    try {
        const userCount = await User.count();
        res.json({ count: userCount })
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/accounts', async (req, res) => {
    try {
        const accounts = await Account.findAll({
            order: [['UserID', 'ASC']]
        });
        res.json(accounts);
    } catch (err) {
        res.status(500).json(err);
    }
});

app.put('/accounts/:accountNo', async (req, res) => {
  const { accountNo } = req.params;
  const { AccountStatus, Scammer } = req.body;
  try {
    const account = await Account.findOne({ where: { AccountNo: accountNo } });
    if (account) {
      account.AccountStatus = AccountStatus;
      account.Scammer = Scammer;
      await account.save();
      res.status(200).json({ message: 'Account updated successfully' });
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/accounts/weekly', async (req, res) => {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 13);

        const accounts = await Account.findAll({
            where: {
                DateOpened: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['DateOpened', 'ASC']]
        });

        // Group accounts by date
        const groupedData = accounts.reduce((acc, account) => {
            const date = account.DateOpened.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = 0;
            }
            acc[date]++;
            return acc;
        }, {});

        // Initialize arrays to hold the account counts for the last 14 days
        const currentWeekData = Array(7).fill(0);
        const previousWeekData = Array(7).fill(0);

        const labels = [];
        for (let i = 0; i < 14; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateString = date.toISOString().split('T')[0];

            if (i < 7) {
                previousWeekData[i] = groupedData[dateString] || 0;
            } else {
                currentWeekData[i - 7] = groupedData[dateString] || 0;
            }

            if (i >= 7) {
                labels.push(dateString);
            }
        }

        res.json({ labels, currentWeekData, previousWeekData });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Last line of code
app.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
});