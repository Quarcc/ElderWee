// Import dependencies
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

// Database
const elderwee = require('./config/DBConnection');
const db = require('./config/db');

const Location = require('./models/Geolocation');
const Account = require('./models/Account');

// Blockchain module
const {Block, Blockchain} = require('./blockchain/blockchain');

const app = express();

app.use(express.json());

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

app.use(
    cors({
        origin: "http://localhost:3000",  //specify domains that can call your API
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

let port = 8000;

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


db.sync().then(() => {
    console.log('Database synchronised');
}).catch((err) => {
    console.log('Error synchronising the database', err);
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













// Last line of code

app.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
});


