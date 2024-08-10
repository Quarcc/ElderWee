// Import dependencies
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser')
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Database
const elderwee = require('./config/DBConnection');
const db = require('./config/db');
const { Op } = require('sequelize');


const User = require('./models/User');
const Account = require('./models/Account');
const Transaction = require('./models/Transaction');
const BlockchainDB = require('./models/Blockchain')
const Location = require('./models/Geolocation');
const AccountLog = require('./models/AccountLogs');
const Enquiry = require('./models/Enquiry');
// send mail
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Blockchain module
const { Block, Blockchain } = require('./blockchain/blockchain');

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Frontend URL
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    }
});

const connectedSockets = new Set();

io.on('connection', (socket) => {
    console.log('a user connected');
    connectedSockets.add(socket);

    socket.on('disconnect', () => {
        console.log('user disconnected');
        connectedSockets.delete(socket);
    });
});

let port = 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
    cors({
        origin: "http://localhost:3000",  //specify domains that can call your API
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

elderwee.setUpDB(false); // true will drop all tables and create again, false will create new tables without losing old ones, true will also delete all existing data

const options = {
    host: db.host,
    port: db.port,
    user: db.username,
    password: db.password,
    database: db.database
}
const sessionStore = new MySQLStore(options);
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

let Bc = new Blockchain();

function getTodayDate() {
    // Create a date object for the current date and time
    const now = new Date();
    const offset = 8 * 60;
    const localOffset = now.getTimezoneOffset();
    const gmt8Time = new Date(now.getTime() + (offset - localOffset) * 60000);
    const year = gmt8Time.getFullYear();
    const month = String(gmt8Time.getMonth() + 1).padStart(2, '0');
    const day = String(gmt8Time.getDate()).padStart(2, '0');

    return {
        startOfToday: `${year}-${month}-${day - 1} 08:00:00`,
        endOfToday: `${year}-${month}-${day} 07:59:59`,
        startOfYesterday: `${year}-${month}-${day - 2} 08:00:00`,
        endOfYesterday: `${year}-${month}-${day - 1} 07:59:59`
    }
}

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
        // Fetch data from database
        const BlockchainDBData = await BlockchainDB.findAll({
            attributes: ['BlockNo', 'TransactionID', 'TransactionDate', 'TransactionAmount', 'TransactionStatus', 'TransactionType', 'TransactionDesc', 'ReceiverID', 'ReceiverAccountNo', 'SenderID', 'SenderAccountNo'],
            order: [['TransactionID', 'ASC']]
        });

        // Create a map to store transactions grouped by TransactionID
        const transactionMap = new Map();

        // Group transactions by TransactionID
        BlockchainDBData.forEach(data => {
            if (!transactionMap.has(data.TransactionID)) {
                transactionMap.set(data.TransactionID, []);
            }
            transactionMap.get(data.TransactionID).push(data);
        });

        // Process transactions and add to blockchain
        transactionMap.forEach(transactions => {
            // Sort transactions by TransactionStatus order: Pending, Completed, Returned
            transactions.sort((a, b) => {
                const statusOrder = { 'Pending': 1, 'Completed': 2, 'Returned': 3 };
                return statusOrder[a.TransactionStatus] - statusOrder[b.TransactionStatus];
            });

            // Add each sorted transaction to blockchain
            transactions.forEach((data) => {
                const blockNumber = data.BlockNo;
                const formattedDate = formatDate(data.TransactionDate);
                Bc.addNewBlock(
                    new Block(blockNumber, formattedDate, {
                        TransactionID: data.TransactionID,
                        TransactionDate: data.TransactionDate,
                        TransactionAmount: data.TransactionAmount,
                        TransactionStatus: data.TransactionStatus,
                        TransactionType: data.TransactionType,
                        TransactionDesc: data.TransactionDesc,
                        ReceiverID: data.ReceiverID,
                        ReceiverAccountNo: data.ReceiverAccountNo,
                        SenderID: data.SenderID,
                        SenderAccountNo: data.SenderAccountNo
                    })
                );
            });
        });

    } catch (err) {
        console.log(err);
    }

    // Output the blockchain data
    console.log(JSON.stringify(Bc, null, 2));
};

initBc();

// API endpoint to get active accounts
app.get('/api/activeAccounts', async (req, res) => {
    try {
        const accounts = await Account.findAll({
            where: { AccountStatus: false },
            include: [{
                model: User,
                attributes: ['FullName', 'PhoneNo']
            }]
        });
        res.json(accounts);
    } catch (error) {
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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});

app.get('/api/displayallaccounts', async (req, res) => {
    try {
        const accounts = await Account.findAll();
        res.json(accounts);
    }
    catch (error) {
        res.status(500).json({ error: message });
    }
});

app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = await Account.findAll();
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ error: message })
    }
})

// === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE ===

function padWithZeros(value) {
    let strValue = value.toString();
    let zerosNeeded = 8 - strValue.length;
    let zeros = '0'.repeat(zerosNeeded);
    return zeros + strValue;
}

app.post('/api/transaction/send/:sender/receive/:receiver', async (req, res) => {
    const { sender, receiver } = req.params;
    const { amt } = req.body;

    try {
        const senderAccount = await Account.findOne({ where: { AccountNo: sender } });
        const receiverAccount = await Account.findOne({ where: { AccountNo: receiver } });
        if (!senderAccount || !receiverAccount) {
            res.status(404).json({ error: 'Account not found' });
            return;
        }
        if (senderAccount.Balance < amt) {
            res.status(400).json({ error: 'Insufficient balance' });
            return;
        }
        const trans = await Transaction.findAll();

        const newTransID = padWithZeros(trans.length + 1);

        const DMZNewTransaction = {
            id: newTransID,
            amount: amt,
            status: 'Checking...'
        }

        // Emit to all connected sockets
        for (let socket of connectedSockets) {
            socket.emit('newTransaction', DMZNewTransaction);
        }

        const transaction = await Transaction.create({
            TransactionID: newTransID,
            TransactionDate: new Date(),
            TransactionAmount: amt,
            TransactionStatus: 'Completed',
            TransactionType: 'Withdrawal',
            TransactionDesc: null,
            ReceiverID: receiverAccount.UserID,
            ReceiverAccountNo: receiverAccount.AccountNo,
            SenderID: senderAccount.UserID,
            SenderAccountNo: senderAccount.AccountNo
        })

        const newSenderBalance = parseInt(senderAccount.Balance) - parseInt(amt);
        const newReceiverBalance = parseInt(receiverAccount.Balance) + parseInt(amt);
        await Account.update({ Balance: newSenderBalance }, { where: { AccountNo: sender } });
        await Account.update({ Balance: newReceiverBalance }, { where: { AccountNo: receiver } });
        res.status(200).json({ message: 'Transaction completed successfully' });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/Blockchain', async (req, res) => {
    try {
        res.status(200).send(JSON.stringify(Bc, null, 2));
    }
    catch (err) {
        res.status(500).json(err);
    }
})

app.get('/api/allTransactions', async (req, res) => {
    try {
        const transactions = await Transaction.findAll();
        res.json(transactions);
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/api/transactionCount', async (req, res) => {
    try {
        const transactionCount = await Transaction.count();
        res.json({ count: transactionCount });
    } catch (err) {
        res.status(500).json(err);
    }
});

app.put('/api/transaction/rollback/id/:transactionID', async (req, res) => {
    const { transactionID } = req.params;
    let transactionDate;
    let transactionAmt;
    let transactionType;
    let transactionDesc;
    let receiverid;
    let receiveraccountnum;
    let senderid;
    let senderaccountnum;
    try {
        const transaction = await Transaction.findOne({ where: { TransactionID: transactionID } });
        if (transaction) {
            transactionDate = transaction.TransactionDate;
            transactionAmt = transaction.TransactionAmount;
            transactionType = transaction.TransactionType;
            transactionDesc = transaction.TransactionDesc;
            receiverid = transaction.ReceiverID;
            receiveraccountnum = transaction.ReceiverAccountNo;
            senderid = transaction.SenderID;
            senderaccountnum = transaction.SenderAccountNo;
            transaction.TransactionStatus = 'Returned';
            await transaction.save();
            res.status(200).json({ message: 'Transaction updated successfully' });
        } else {
            res.status(404).json({ error: 'Transaction not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

    const newTransactionDB = await BlockchainDB.create({
        BlockNo: (Math.random() + ' ').substring(2, 10) + (Math.random() + ' ').substring(2, 10),
        TransactionID: transactionID,
        TransactionDate: transactionDate,
        TransactionAmount: transactionAmt,
        TransactionStatus: 'Returned',
        TransactionType: transactionType,
        TransactionDesc: transactionDesc,
        ReceiverID: receiverid,
        ReceiverAccountNo: receiveraccountnum,
        SenderID: senderid,
        SenderAccountNo: senderaccountnum
    });

    if (newTransactionDB) {
        initBc();
    }
})

app.get('/api/FrozenFunds', async (req, res) => {
    try {
        const frozenFunds = await Transaction.findAll();
        res.json(frozenFunds);
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/api/FrozenFunds/Today', async (req, res) => {
    const { startOfToday, endOfToday } = getTodayDate();
    try {
        const frozenFunds = await Transaction.findAll({
            where: {
                TransactionDate: {
                    [Op.between]: [startOfToday, endOfToday]
                }
            }
        });
        res.send(frozenFunds);
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/api/FrozenFunds/Yesterday', async (req, res) => {
    const { startOfYesterday, endOfYesterday } = getTodayDate();
    try {
        const frozenFunds = await Transaction.findAll({
            where: {
                TransactionDate: {
                    [Op.between]: [startOfYesterday, endOfYesterday]
                }
            }
        });
        res.send(frozenFunds);
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/api/totalTransactionAmount', async (req, res) => {
    try {
        const totalAmount = await Transaction.sum('TransactionAmount');
        res.json({ totalAmount });
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/api/transaction/weeklyTransaction', async (req, res) => {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 13);

        const transactions = await Transaction.findAll({
            where: {
                TransactionDate: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['TransactionDate', 'ASC']]
        });

        // Group accounts by date
        const groupedData = transactions.reduce((acc, transaction) => {
            const date = transaction.TransactionDate.toISOString().split('T')[0];
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

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/api/users/email/:email', async (req, res) => {
    const { email } = req.params;
    console.log(req.params);
    try {
        const user = await User.findOne({ where: { Email: email } });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

app.get('/api/users/:userID', async (req, res) => {
    const { userID } = req.params
    try {
        const user = await User.findOne({ where: { UserID: userID } });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/api/userCount', async (req, res) => {
    try {
        const userCount = await User.count() - 1;
        res.json({ count: userCount })
    } catch (err) {
        res.status(500).json(err);
    }
});

app.put('/api/users/:userID', async (req, res) => {
    const { userID } = req.params;
    const { FullName, DOB, Email, PhoneNo } = req.body;
    try {
        const user = await User.findOne({ where: { UserID: userID } });
        if (user) {
            user.FullName = FullName;
            user.DOB = DOB;
            user.Email = Email;
            user.PhoneNo = PhoneNo;
            await user.save();
            res.status(200).json({ message: "User Updated Successfully" });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:userID', async (req, res) => {
    const { userID } = req.params;
    const newUserID = 999;

    try {
        const user = await User.findOne({ where: { UserID: userID } });
        if (user) {

            console.log(`Updating accounts from userID ${userID} to ${newUserID}`);

            const updatedAccounts = await Account.update(
                { UserID: newUserID },
                { where: { UserID: userID } }
            );

            const updatedSTransactions = await Transaction.update(
                { SenderID: newUserID },
                { where: { SenderID: userID } }
            );

            const updatedRTransactions = await Transaction.update(
                { ReceiverID: newUserID },
                { where: { ReceiverID: userID } }
            );

            const updateSBlockchainDB = await BlockchainDB.update(
                { SenderID: newUserID },
                { where: { SenderID: userID } }
            );

            const updateRBlockchainDB = await BlockchainDB.update(
                { ReceiverID: newUserID },
                { where: { ReceiverID: userID } }
            );

            initBc();

            console.log(`${updatedAccounts[0]} accounts updated.`);

            await user.destroy();
            res.status(200).json({ message: "User Deleted Successfully" });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/accounts/log', async (req, res) => {
    const { AccountNo, LoginCoords, LastIPLoginCountry, Flagged, LoginTime } = req.body;

    try {
        const newLog = await AccountLog.create({
            AccountNo,
            LoginCoords,
            LastIPLoginCountry,
            Flagged,
            LoginTime,
        });
        console.log("New account log created:", newLog.toJSON());
        res.json(newLog);
    } catch (error) {
        console.error("Error creating new account log:", error);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = await Account.findAll({
            order: [['UserID', 'ASC']]
        });
        res.json(accounts);
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/api/accounts/userid/:userid', async (req, res) => {
    const { userid } = req.params;

    try {
        console.log(`Fetching account for UserID: ${userid}`);

        const acc = await Account.findOne({ where: { UserID: userid } });

        if (acc) {
            res.json(acc);
        } else {
            res.status(404).json({ error: "Account not found" });
        }
    } catch (err) {
        console.error('Error fetching account:', err); // Log detailed error information
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});


app.put('/api/accounts/:accountNo', async (req, res) => {
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

app.get('/api/accounts/weekly', async (req, res) => {
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

app.get('/api/enquiries', async (req, res) => {
    try {
        const enquiries = await Enquiry.findAll({
            attributes: ['EnquiryID', 'EnquiryDate', 'EnquiryType', 'EnquiryStatus', 'EnquiryDetails', 'UserID', 'AccountNo']
        });

        const users = await User.findAll({
            attributes: ['UserID', 'FullName', 'Email']
        });

        const userMap = {};
        users.forEach(user => {
            userMap[user.UserID] = {
                FullName: user.FullName,
                Email: user.Email
            };
        });

        const formattedData = enquiries.map(enquiry => ({
            EnquiryID: enquiry.EnquiryID,
            EnquiryDate: enquiry.EnquiryDate,
            EnquiryType: enquiry.EnquiryType,
            EnquiryStatus: enquiry.EnquiryStatus,
            EnquiryDetails: enquiry.EnquiryDetails,
            AccountNo: enquiry.AccountNo,
            FullName: userMap[enquiry.UserID] ? userMap[enquiry.UserID].FullName : null,
            Email: userMap[enquiry.UserID] ? userMap[enquiry.UserID].Email : null
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching enquiries:', error.stack);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/enquiriesCount', async (req, res) => {
    try {
        const enquiryCount = await Enquiry.count();
        res.json({ count: enquiryCount })
    } catch (err) {
        res.status(500).json(err);
    }
});

const generateRandomAccountNo = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };
  

app.post('/signup', async (req, res) => {
    try {
        const { fullName, dob, email, phoneNo, password } = req.body;

        // Create user in database using Sequelize model
        const newUser = await User.create({
            FullName: fullName,
            DOB: dob,
            Email: email,
            PhoneNo: phoneNo,
            Password: password,
        });
        const accountNo = generateRandomAccountNo();
        const newAccount = await Account.create({
            AccountNo: accountNo,
            DateOpened: new Date(),
            UserID: newUser.UserID
        });

        // Respond with the newly created user object
        res.status(201).json({
            message: 'User and account created successfully',
            user: newUser,
            account: newAccount,
        });
    } catch (error) {
        console.error('Error creating user and account:', error);
        res.status(500).json({ error: 'Error creating user and account' });
    }
});




const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'justprepco@gmail.com',
        pass: 'uhru lnfq oalh duxz', // Use your app-specific password here
    },
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { Email: email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const resetLink = `http://localhost:3000/reset-password/${token}`;

        // Save the token to the user record in the database
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
        await user.save();

        const mailOptions = {
            from: 'justprepco@gmail.com',
            to: user.Email,
            subject: 'Password Reset',
            html: `<p>You requested a password reset</p>
                   <p>Click this <a href="${resetLink}">link</a> to set a new password.</p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ error: 'Error sending email' });
            }
            res.status(200).json({ message: 'Password reset link sent' });
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    try {
        const user = await User.findOne({ where: { resetToken: token, resetTokenExpiration: { [Op.gt]: Date.now() } } });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // const hashedPassword = await bcrypt.hash(password, 10); // Comment this line out for now
        user.Password = password; // Save the plain text password for now
        user.resetToken = null;
        user.resetTokenExpiration = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { Email: email } });

        if (!user || user.Password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user.UserID; // Set userId in session
        console.log('User ID set in session:', req.session.userId);

        res.status(200).json({ message: 'Login successful', user });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Check session route
app.get('/check-session', (req, res) => {
    console.log('Session:', req.session);
    console.log('UserID:', req.session.userId);
    if (req.session.userId) {
        User.findByPk(req.session.userId)
            .then(user => {
                if (user) {
                    res.status(200).json({ loggedIn: true, user });
                } else {
                    console.log('No user found for UserID:', req.session.userId);
                    res.status(401).json({ loggedIn: false });
                }
            })
            .catch(error => {
                console.error('Error fetching user:', error);
                res.status(500).json({ error: 'Server error' });
            });
    } else {
        console.log('No UserID in session');
        res.status(401).json({ loggedIn: false });
    }
});

app.get('/user-profile', async (req, res) => {
    const userId = req.session.userId;
  
    try {
      const user = await User.findByPk(userId, {
        include: [{
          model: Account,
          attributes: ['AccountNo', 'Balance']
        }]
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user profile' });
    }
  });
  
  


app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

const otpDictionary = {}; 
const otpExpirationTime = 5 * 60 * 1000; //3mins

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
}

async function sendOtpEmail(toEmail, otp) {
    try {
        const mailOptions = {
            from: 'justprepco@gmail.com',
            to: toEmail,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);
        console.log('OTP sent successfully');
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
}

app.post('/send-otp', async (req, res) => {
    const { newEmail } = req.body;
    const userId = req.session.userId;
    console.log({newEmail})

    // Generate OTP
    const otp = generateOtp();
    const expirationTime = Date.now() + otpExpirationTime;

    // Store OTP and expiration time
    otpDictionary[userId] = { otp, expirationTime };

    // Send OTP to new email
    await sendOtpEmail(newEmail, otp);

    res.status(200).send('OTP sent to new email');
});

app.post('/verify-otp', async (req, res) => {
    const { otp, newEmail } = req.body;
    const userId = req.session.userId; 
    console.log('Email to update:', newEmail);
    console.log('UserID:', userId);

    if (!otpDictionary[userId]) {
        return res.status(400).send('OTP not found');
    }

    const { otp: storedOtp, expirationTime } = otpDictionary[userId];

    if (Date.now() > expirationTime) {
        delete otpDictionary[userId];
        return res.status(400).json({ error: 'OTP expired' });
    }

    if (parseInt(otp) !== storedOtp) {
        return res.status(400).json({ error: 'OTP does not match' });
    }

    try {
        const result = await User.update({ Email: newEmail }, { where: { UserID: userId } });
        console.log('Update result:', result);
        delete otpDictionary[userId];
        res.status(200).send('Email updated successfully');
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).send('Server error');
    }
});

app.post('/check-email', async (req, res) => {
    const { newEmail } = req.body;

    try {
        const user = await User.findOne({ where: { Email: newEmail } });
        if (user) {
            res.status(200).json({ exists: true });
        } else {
            res.status(200).json({ exists: false });
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
  });

  const upload = multer({ storage: storage });

  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }


  app.post('/upload-profile-image', upload.single('profileImage'), async (req, res) => {
    const userId = req.session.userId;
    const profileImage = req.file.filename;
  
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      user.profilePic = profileImage;
      await user.save();
  
      res.status(200).json({ profilePic: profileImage });
    } catch (error) {
      res.status(500).json({ error: 'Error updating profile image' });
    }
  });

  app.use('/uploads', express.static('uploads'));

// Initialize cards storage
const userCards = {}; // Key: UserID, Value: Array of Cards

// Add Card Endpoint
app.post('/add-card', (req, res) => {
    const { cardNumber, cvc } = req.body;
    const userID = req.session.userId; // Get UserID from session
  
    if (!cardNumber || !cvc || !userID) {
        return res.status(400).json({ message: 'Card number, CVC, and UserID are required' });
    }
  
    if (!userCards[userID]) {
        userCards[userID] = [];
    }

    const maskedCardNumber = cardNumber.replace(/.(?=.{4})/g, 'X');
    userCards[userID].push({ cardNumber: maskedCardNumber, cvc });
    res.status(201).json({ message: 'Card added successfully' });
});

// Get Cards Endpoint
app.get('/cards', (req, res) => {
    const userID = req.session.userId;  
  
    if (!userCards[userID]) {
        // Return an empty array if no cards are found
        return res.status(200).json([]);
    }
  
    res.status(200).json(userCards[userID]);
});

// Delete Card Endpoint
app.delete('/delete-card', (req, res) => {
    const { cardNumber } = req.body;
    const userID = req.session.userId;  // Get UserID from session
    console.log('helppppp', userID, cardNumber)
  
    if (!cardNumber || !userID || !userCards[userID]) {
        return res.status(400).json({ message: 'Card number and UserID are required' });
    }
  
    userCards[userID] = userCards[userID].filter(card => card.cardNumber !== cardNumber);
    res.sendStatus(204);
});

// Payment Endpoint
app.post('/process-payment', async (req, res) => {
    const { cardNumber, amount } = req.body;
    const userID = req.session.userId; // Get UserID from session

    if (!cardNumber || !amount || !userID) {
        return res.status(400).json({ message: 'Card number, amount, and UserID are required' });
    }

    try {
        // Simulate a delay for payment processing
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Assuming you have logic to validate the card and process the payment here

        // Update the user's account balance
        const account = await Account.findOne({ where: { UserID: userID } });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        account.Balance += parseFloat(amount);
        await account.save();

        res.status(200).json({ message: 'Payment processed successfully' });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'An error occurred while processing the payment' });
    }
});

app.post('/transfer', async (req, res) => {
    const { receiverIdentifier, amount, description } = req.body;
    const senderUserId = req.session.userId;

    if (!senderUserId) {
        return res.status(401).json({ success: false, message: 'userID is undefined' });
    }

    try {
        
        // Find the receiver by phone number, account number, or email
        let receiverUser = await User.findOne({
            where: {
                [Sequelize.Op.or]: [
                    { PhoneNo: receiverIdentifier },
                    { Email: receiverIdentifier }
                ]
            }
        });

        if (!receiverUser) {
            return res.status(404).json({ success: false, message: 'Receiver not found' });
        }

        // Find sender's account
        const senderAccount = await Account.findOne({ where: { UserID: senderUserId } });
        if (!senderAccount) {
            return res.status(404).json({ success: false, message: 'Sender account not found' });
        }

        if (senderAccount.Balance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient funds' });
        }

        // Find receiver's account
        const receiverAccount = await Account.findOne({ where: { UserID: receiverUser.UserID } });
        if (!receiverAccount) {
            return res.status(404).json({ success: false, message: 'Receiver account not found' });
        }

        // Update balances
        senderAccount.Balance -= amount;
        receiverAccount.Balance += amount;

        await senderAccount.save();
        await receiverAccount.save();

        // Record the transaction
        await Transaction.create({
            TransactionID: crypto.randomBytes(16).toString('hex'),
            TransactionDate: new Date(),
            TransactionAmount: amount,
            TransactionStatus: 'Success',
            TransactionType: 'Transfer',
            TransactionDesc: description || 'Fund Transfer',
            ReceiverID: receiverUser.UserID,
            ReceiverAccountNo: receiverAccount.AccountNo
        });

        res.status(200).json({ success: true, message: 'Transfer successful' });
    } catch (error) {
        console.error('Error processing transfer:', error);
        res.status(500).json({ success: false, message: 'Error processing transfer' });
    }
});

app.get('/user-balance', async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Fetch account details associated with the user
        const account = await Account.findOne({
            where: { UserID: userId },
            attributes: ['AccountNo', 'Balance']
        });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        return res.json({
            accountNumber: account.AccountNo,
            balance: account.Balance
        });
    } catch (error) {
        console.error('Error fetching user balance:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/check-receiver', async (req, res) => {
    try {
        const { identifier } = req.query;
        console.log('Received identifier:', identifier);

        if (!identifier) {
            return res.status(400).json({ message: 'Identifier is required' });
        }

        // Check if the identifier matches a user by email or phone number
        const user = await User.findOne({
            where: {
                [Sequelize.Op.or]: [
                    { Email: identifier },
                    { PhoneNo: identifier }
                ]
            }
        });

        console.log('User found:', user);

        if (!user) {
            return res.status(404).json({ exists: false, message: 'Receiver not registered' });
        }

        // If user exists, check account status
        const account = await Account.findOne({ where: { UserID: user.UserID } });

        if (!account) {
            return res.status(404).json({ exists: true, message: 'Account not found' });
        }

        if (account.AccountStatus) {
            return res.status(403).json({ message: 'Receiver\'s account is locked' });
        }

        if (account.Scammer) {
            return res.status(403).json({ message: 'Receiver is flagged as a scammer' });
        }

        res.json({ exists: true, message: 'Receiver is valid', accountNo: account.AccountNo });
    } catch (error) {
        console.error('Error checking receiver:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/transactions', async (req, res) => {
    try {
      const userId = req.session.userId;
      console.log('PLS WORK', userId)
  
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      const transactions = await Transaction.findAll({
        where: { ReceiverID: userId },
        order: [['TransactionDate', 'DESC']],
      });
  
      res.json({ transactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });



console.log("Hello World");

server.listen(4000, () => {
    console.log(`Server running on http://localhost:4000`);
});

// Last line of code
app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
});