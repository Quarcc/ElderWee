// Import dependencies
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser')
const cors = require('cors');
const { Sequelize, DataTypes, where } = require('sequelize');
const http = require('http');
const { Server } = require('socket.io');
const aws = require("aws-sdk");
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ngrok = require('ngrok');
require('dotenv').config();

// Database
const elderwee = require('./config/DBConnection');
const db = require('./config/db');
const { Op } = require('sequelize');

const User = require('./models/User');
const Account = require('./models/Account');
const Transaction = require('./models/Transaction');
const BlockchainDB = require('./models/Blockchain');
const Email = require('./models/Email');
const Location = require('./models/Geolocation');
const AccountLog = require('./models/AccountLogs');
const Enquiry = require('./models/Enquiry');
const BannedCountries = require('./models/BannedCountries');

// AI
const { filterEmails } = require('./openai/ai');

// send mail
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Blockchain module
const { Block, Blockchain } = require('./blockchain/blockchain');
const FrozenTransaction = require('./models/FrozenTransaction');

//otp
const otpDictionary = {}; 
const otpExpirationTime = 5 * 60 * 1000; 
const userCards = {}


const app = express();

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const rekognition = new aws.Rekognition();

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
app.use(express.json());

app.use(
    cors({
        origin: ["http://localhost:3000", "https://mail.google.com"],  //specify domains that can call your API
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization, email, "],
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
};

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

// Adjust to Singapore Time
const localDate = new Date();
const sgDate = localDate.getTime() - (localDate.getTimezoneOffset() * 60000);

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

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_KEY, // Use your app-specific password here
    },
});

let ngrokopenurl

// === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE ===

app.get("/api/activeAccounts", async (req, res) => {
    try {
        const accounts = await Account.findAll({
            attributes: ["AccountNo"],
            where: { AccountStatus: false },
        });

        const users = await User.findAll({
            attributes: ["PhoneNo", "FullName"],
        });

        const userMap = {};
        users.forEach((user) => {
            userMap[user.UserID] = {
                PhoneNo: user.PhoneNo,
                FullName: user.FullName,
            };
        });

        const formattedData = accounts.map((account) => ({
            AccountNo: account.AccountNo,
            FullName: userMap[account.UserID]
                ? userMap[account.UserID].FullName
                : null,
            PhoneNo: userMap[account.UserID] ? userMap[account.UserID].PhoneNo : null,
        }));
        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/flaggedAccounts", async (req, res) => {
    try {
        const accounts = await Account.findAll({
            where: { Scammer: true },
        });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/accountlogs", async (req, res) => {
    try {
        const logs = await AccountLog.findAll();
        if (logs) {
            res.json(logs);
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json(err);
    }
});

app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = await Account.findAll();
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ error: message })
    }
     
});

app.put("/api/countries/ban-status/:countryName", async (req, res) => {
    const { countryName } = req.params;
    const { isBanned } = req.body;

    try {
        let country = await BannedCountries.findOne({
            where: { CountryName: countryName },
        });
        if (country) {
            country.isBanned = isBanned;
            await country.save();
            return res.status(200).json({
                message: `${countryName} ${isBanned ? "banned" : "unbanned"} successfully.`,
            });
        } else {
            const newCountry = await BannedCountries.create({
                CountryName: countryName,
                isBanned: isBanned,
            });

            return res.status(200).json({ message: `${countryName} added to banlist.` });
        }
    } catch (err) {
        return res.status(500).json(err);
    }
});

app.get('/api/countries/banned', async (req, res) => {
    try {
        let banList = await BannedCountries.findAll({ where: { isBanned: 1 } });
        return res.status(200).json(banList);
    }
    catch (err) {
        return res.status(500).json({ err });
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

    const receiver = await Account.findOne({ where: { UserID: receiverid } });
    receiver.BalanceDisplay -= transactionAmt;

    const sender = await Account.findOne({ where: { UserID: senderid } });
    sender.BalanceDisplay += transactionAmt;

    receiver.save();
    sender.save();

    const frozenDestroyer = await FrozenTransaction.findOne({
        where: {
            TransactionID: transactionID
        }
    })
    frozenDestroyer.destroy();

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

app.put('/api/transaction/release/id/:transactionID', async (req, res) => {
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
            transaction.TransactionStatus = 'Completed';
            await transaction.save();
            res.status(200).json({ message: 'Transaction updated successfully' });
        } else {
            res.status(404).json({ error: 'Transaction not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

    const receiver = await Account.findOne({ where: { UserID: receiverid } });
    receiver.Balance += transactionAmt;

    const sender = await Account.findOne({ where: { UserID: senderid } });
    sender.Balance -= transactionAmt;

    receiver.save();
    sender.save();

    const frozenDestroyer = await FrozenTransaction.findOne({
        where: {
            TransactionID: transactionID
        }
    })
    frozenDestroyer.destroy();

    const newTransactionDB = await BlockchainDB.create({
        BlockNo: (Math.random() + ' ').substring(2, 10) + (Math.random() + ' ').substring(2, 10),
        TransactionID: transactionID,
        TransactionDate: transactionDate,
        TransactionAmount: transactionAmt,
        TransactionStatus: 'Completed',
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

app.get('/api/FrozenTransactions', async (req, res) => {
    try {
        const frozenFunds = await FrozenTransaction.findAll();
        res.json(frozenFunds);
    } catch (err) {
        res.status(500).json(err);
    }
})

app.get('/api/FrozenTransactions/:id', async (req, res) => {
    try {
        const frozenFunds = await FrozenTransaction.findAll({
            where: {
                transactionID : req.params.id
            }
        });
        res.json(frozenFunds);
    } catch (err) {
        res.status(500).json(err);
    }
})

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

app.get('/api/allEmails', async (req, res) => {
    try {
        const emails = await Email.findAll();
        res.json(emails);
    } catch (err) {
        res.status(500).json(err);
    }
})

app.get('/api/emailSent', async (req, res) => {
    try {
        const emailSent = await Email.findAll({
            attributes: ['EmailSent']
        })
        res.status(200).send(emailSent);
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/api/emailOpened', async (req, res) => {
    try {
        const emailOpened = await Email.findAll({
            attributes: ['EmailOpened']
        })
        res.status(200).send(emailOpened);
    } catch (err) {
        res.status(500).json(err);
    }
});

app.post('/api/massEmail', upload.single('EmailAttachment'), async (req, res) => {
    const { targetEmail, EmailSubject, EmailBody } = req.body;
    const EmailDate = new Date();
    const EmailOpened = 0;
    const EmailAttachment = req.file ? req.file.filename : null; // Get the uploaded file name

    const dataLength = await Email.findAll();
    const EmailID = dataLength.length + 1;

    const emailData = await User.findAll({
        attributes: ['Email']
    });

    const emailDataJson = JSON.stringify(emailData.map(email => ({ Email: email.Email })));
    const aiResponse = await filterEmails(emailDataJson, targetEmail);

    if (aiResponse.length === 0) {
        return res.status(400).json({ message: "No emails found to send." });
    }

    const EmailSent = aiResponse.length;

    try {
        for (const emailaddresses of aiResponse) {
            console.log('Sending to:', emailaddresses.Email);

            const mailContent = {
                from: '"ElderWee" <contacteventnow@gmail.com>',
                to: emailaddresses.Email,
                subject: EmailSubject,
                html: `
                    <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; }
                                h1 { color: #333; }
                                p { color: #666; }
                                .highlight { color: #007BFF; }
                            </style>
                        </head>
                        <body>
                            <img src="${ngrokopenurl}/api/imagebugger/track/${EmailID}" alt="" style="display:block; max-width: 150px;"/>
                            <h1>${EmailSubject}</h1>
                            <p>${EmailBody}</p>
                            <p>Best regards,<br>Your ElderWee Team</p>
                        </body>
                    </html>
                `,
                attachments: []
            };

            if (EmailAttachment !== null) {
                const attachmentPath = './uploads/' + EmailAttachment;
                console.log('Attachment:', attachmentPath);

                if (fs.existsSync(attachmentPath)) {
                    mailContent.attachments.push({
                        filename: `${EmailSubject}.${EmailAttachment.split('.').pop()}`,
                        path: attachmentPath,
                    });
                } else {
                    console.error('Attachment file does not exist:', attachmentPath);
                    return res.status(400).json({ error: 'Attachment file not found.' });
                }
            }

            await transporter.sendMail(mailContent); // Use await here
            console.log('Email sent to:', emailaddresses.Email);
        }

        const emails = await Email.create({ EmailDate, EmailSubject, EmailBody, EmailAttachment, EmailSent, EmailOpened });
        res.status(200).send(emails);

    } catch (err) {
        console.error('Error while sending emails:', err);
        res.status(500).json({ error: 'Failed to send emails.' });
    }
});

app.get('/api/imagebugger/track/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const emails = await Email.findOne({ where: { EmailID: id } });
        emails.EmailOpened += 1;
        await emails.save();
        const filePath = "C:/ElderWee/Backend/uploads/logo-email.png";
        res.sendFile(filePath);
    } catch (err) {
        res.status(500).json(err);
    }
})

app.get('/api/download/emailattachment/:filename', async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);
    res.download(filePath);
})

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
        endDate.setHours(0, 0, 0, 0);
        const startDate = new Date(endDate);
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

        // Initialize arrays to hold the transaction counts for the last 14 days
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
        res.status(500).json({ error: err.message });
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

app.post("/api/accounts/log", async (req, res) => {
    const { AccountNo, LoginCoords, LastIPLoginCountry, Flagged, LoginTime } = req.body;

    try {
        const newLog = await AccountLog.create({
            AccountNo,
            LoginCoords,
            LastIPLoginCountry,
            Flagged,
            LoginTime,
        });
        console.log("New user created:", newLog.toJSON());
        res.json(newLog);
    } catch (error) {
        console.error("Error creating new user:", error);
        return res.status(404).json({ error: error });
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
        const acc = await Account.findOne({ where: { UserID: userid } });
        if (acc) {
            res.json(acc);
        } else {
            res.status(404).json({ error: "Account not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

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

app.put('/api/enquiries/:enquiryID', async (req, res) => {
    const { enquiryID } = req.params;
    const { EnquiryStatus } = req.body; // Ensure EnquiryStatus is treated as an integer or string based on your setup

    try {
        const enquiry = await Enquiry.findOne({ where: { EnquiryID: enquiryID } });
        if (enquiry) {
            enquiry.EnquiryStatus = EnquiryStatus; // Ensure the status value is correctly assigned
            await enquiry.save();
            res.status(200).json({ message: 'Enquiry Status updated successfully' });
        } else {
            res.status(404).json({ error: 'Enquiry not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/enquiries', async (req, res) => {
    const userId = req.session.userId;
    const { EnquiryType, EnquiryDetails } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User not logged in' });
    }

    try {
        const user = await User.findOne({ where: { UserID: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const account = await Account.findOne({ where: { UserID: userId } });
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const newEnquiry = await Enquiry.create({
            EnquiryType,
            EnquiryDetails,
            EnquiryDate: sgDate, // Store date in Singapore Time
            UserID: userId,
            AccountNo: account.AccountNo,
        });

        res.status(201).json(newEnquiry);
    } catch (error) {
        console.error('Error Creating Enquiry:', error.message);
        res.status(400).json({ error: 'Failed to create enquiry' });
    }
});


async function generateUniqueAccountNumber() {
    let accountNo;
    let isUnique = false;

    while (!isUnique) {
        accountNo = Math.floor(100000000000 + Math.random() * 900000000000).toString();;
        const existingAccount = await Account.findOne({ where: { AccountNo: accountNo } });

        if (!existingAccount) {
            isUnique = true;
        }
    }

    return accountNo;
}

app.post('/signup', async (req, res) => {
    try {
        const { fullName, dob, email, phoneNo, password } = req.body;

        // Basic validation
        if (!fullName || !dob || !email || !phoneNo || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in database using Sequelize model
        const newUser = await User.create({
            FullName: fullName,
            DOB: dob,
            Email: email,
            PhoneNo: phoneNo,
            Password: hashedPassword,
        });

        // Generate a unique account number
        const uniqueAccountNo = await generateUniqueAccountNumber();

        // Create associated account for the new user
        const newAccount = await Account.create({
            AccountNo: uniqueAccountNo,
            DateOpened: new Date(), // Sets the current date and time
            // other default values or logic for account fields
            UserID: newUser.UserID // Set the foreign key to associate the account with the user
        });

        // Respond with the newly created user and account object (excluding passwords)
        const { Password, ...userWithoutPassword } = newUser.toJSON();
        res.status(201).json({
            message: 'Sign-up successful',
            user: userWithoutPassword,
            account: newAccount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { Email: email } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare the hashed password stored in the database with the plain-text password
        const isMatch = await bcrypt.compare(password, user.Password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set the user ID in the session
        req.session.userId = user.UserID;
        console.log("LOGIN SESSION:",req.session);
        // Respond with a success message and user data (excluding password)
        const { Password, ...userWithoutPassword } = user.toJSON();
        res.status(200).json({ message: 'Login successful', user: userWithoutPassword });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/authenticate-face-login',async(req,res)=>{
    const {email} = req.body;
    try{
        const user = await User.findOne({where: {Email:email}});
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user.UserID;
        console.log("FACELOGIN:",req.session);
        const { Password, ...userWithoutPassword } = user.toJSON();
        res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
    }catch(error){
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
})

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
            from: '"ElderWee" <contacteventnow@gmail.com',
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
        // Find the user with the matching reset token and valid expiration
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update the user's password and clear the reset token and expiration
        user.Password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
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
          attributes: ['AccountNo', 'BalanceDisplay']
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


function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
}

async function sendOtpEmail(toEmail, otp) {
    try {
        const mailOptions = {
            from: '"ElderWee" <contacteventnow@gmail.com',
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


app.post('/check-unique-email', async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ where: { email } });
      if (user) {
        return res.json({ exists: true });
      }
      res.json({ exists: false });
    } catch (error) {
      console.error('Error checking email:', error);
      res.status(500).json({ exists: false });
    }
  });
  

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
    console.log('Session Data:', req.session);
    const { cardNumber } = req.body;
    const userID = req.session.userId; 
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
    const userID = req.session.userId; 

    if (!cardNumber || !amount || !userID) {
        return res.status(400).json({ message: 'Card number, amount, and UserID are required' });
    }

    try {
        // Simulate a delay for payment processing
        await new Promise(resolve => setTimeout(resolve, 5000));

        
        const account = await Account.findOne({ where: { UserID: userID } });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        await Transaction.create({
            TransactionID: crypto.randomBytes(16).toString('hex'),
            TransactionDate: new Date(),
            TransactionAmount: parseFloat(amount),
            TransactionStatus: 'Completed',
            TransactionType: 'Top Up', // You can use 'Top Up' or another type you prefer
            TransactionDesc: `Top-up from card ending in ${cardNumber.slice(-4)}`,
            ReceiverID: userID,
            ReceiverAccountNo: account.AccountNo,
            SenderID: userID,
            SenderAccountNo: account.AccountNo 
        });

        // Update the account balance
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
    
    const trans = await Transaction.findAll();

    const transID = padWithZeros(trans.length + 1);

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
        if (receiverUser.UserID === senderUserId) {
            return res.status(400).json({ success: false, message: 'You cannot send money to yourself. Please use the top-up function instead.' });
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

        const accountNo1 = await Account.findOne({
            where: {
                UserID: receiverUser.UserID,
            }
        })

        const accountNo2 = await Account.findOne({
            where: {
                UserID: senderUserId,
            }
        })

        const loginCountry1 = await AccountLog.findOne({
            where: {
                AccountNo: accountNo1.AccountNo,
            }
        })

        const loginCountry2 = await AccountLog.findOne({
            where: {
                AccountNo: accountNo2.AccountNo,
            }
        })

        const bannedCountry = await BannedCountries.findAll(
            {
                where: {
                    isBanned: true
                }
            },
            {
                attributes: ['CountryName']
            }
        )

        const bannedCountryNames = bannedCountry.map(country => country.CountryName);

        if (accountNo1.Scammer == true || accountNo2.Scammer == true) {
            const DMZNewTransaction = {
                id: transID,
                amount: amount,
                status: 'Checking...'
            }
    
            // Emit to all connected sockets
            for (let socket of connectedSockets) {
                socket.emit('newTransaction', DMZNewTransaction);
            }

            await FrozenTransaction.create({
                TransactionID: transID,
                SenderAccountNo: accountNo2.AccountNo,
                ReceiverAccountNo: accountNo1.AccountNo,
                TransactionDate: new Date(),
                TransactionAmount: amount,
                Reason: 'Identified Scammer'
            })

            senderAccount.BalanceDisplay -= amount;
            receiverAccount.BalanceDisplay += amount;
            await senderAccount.save();
            await receiverAccount.save();
            
            await Transaction.create({
                TransactionID: transID,
                TransactionDate: new Date(),
                TransactionAmount: amount,
                TransactionStatus: 'Pending',
                TransactionType: 'Transfer',
                TransactionDesc: description || 'Fund Transfer',
                ReceiverID: receiverUser.UserID,
                ReceiverAccountNo: receiverAccount.AccountNo,
                SenderID: senderUserId,
                SenderAccountNo: senderAccount.AccountNo
            });

            const newTransactionDB = await BlockchainDB.create({
                BlockNo: (Math.random() + ' ').substring(2, 10) + (Math.random() + ' ').substring(2, 10),
                TransactionID: transID,
                TransactionDate: new Date(),
                TransactionAmount: amount,
                TransactionStatus: 'Pending',
                TransactionType: 'Transfer',
                TransactionDesc: description || 'Fund Transfer',
                ReceiverID: receiverUser.UserID,
                ReceiverAccountNo: receiverAccount.AccountNo,
                SenderID: senderUserId,
                SenderAccountNo: senderAccount.AccountNo
            });

            if (newTransactionDB) {
                initBc();
            }
        }
        else if (bannedCountryNames.includes(loginCountry1.LastIPLoginCountry) || bannedCountryNames.includes(loginCountry2.LastIPLoginCountry)) {

            const DMZNewTransaction = {
                id: transID,
                amount: amount,
                status: 'Checking...'
            }
    
            // Emit to all connected sockets
            for (let socket of connectedSockets) {
                socket.emit('newTransaction', DMZNewTransaction);
            }

            await FrozenTransaction.create({
                TransactionID: transID,
                SenderAccountNo: accountNo2.AccountNo,
                ReceiverAccountNo: accountNo1.AccountNo,
                TransactionDate: new Date(),
                TransactionAmount: amount,
                Reason: 'Sanctioned Country Present'
            })

            senderAccount.BalanceDisplay -= amount;
            receiverAccount.BalanceDisplay += amount;
            await senderAccount.save();
            await receiverAccount.save();
            
            await Transaction.create({
                TransactionID: transID,
                TransactionDate: new Date(),
                TransactionAmount: amount,
                TransactionStatus: 'Pending',
                TransactionType: 'Transfer',
                TransactionDesc: description || 'Fund Transfer',
                ReceiverID: receiverUser.UserID,
                ReceiverAccountNo: receiverAccount.AccountNo,
                SenderID: senderUserId,
                SenderAccountNo: senderAccount.AccountNo
            });

            const newTransactionDB = await BlockchainDB.create({
                BlockNo: (Math.random() + ' ').substring(2, 10) + (Math.random() + ' ').substring(2, 10),
                TransactionID: transID,
                TransactionDate: new Date(),
                TransactionAmount: amount,
                TransactionStatus: 'Pending',
                TransactionType: 'Transfer',
                TransactionDesc: description || 'Fund Transfer',
                ReceiverID: receiverUser.UserID,
                ReceiverAccountNo: receiverAccount.AccountNo,
                SenderID: senderUserId,
                SenderAccountNo: senderAccount.AccountNo
            });

            if (newTransactionDB) {
                initBc();
            }
        }
        else {

            const DMZNewTransaction = {
                id: transID,
                amount: amount,
                status: 'Checking...'
            }
    
            // Emit to all connected sockets
            for (let socket of connectedSockets) {
                socket.emit('newTransaction', DMZNewTransaction);
            }

            // Update balances
            senderAccount.BalanceDisplay -= amount;
            receiverAccount.BalanceDisplay += amount;
            senderAccount.Balance -= amount;
            receiverAccount.Balance += amount;

            await senderAccount.save();
            await receiverAccount.save();

            // Record the transaction
            await Transaction.create({
                TransactionID: transID,
                TransactionDate: new Date(),
                TransactionAmount: amount,
                TransactionStatus: 'Completed',
                TransactionType: 'Transfer',
                TransactionDesc: description || 'Fund Transfer',
                ReceiverID: receiverUser.UserID,
                ReceiverAccountNo: receiverAccount.AccountNo,
                SenderID: senderUserId,
                SenderAccountNo: senderAccount.AccountNo
            });

            const newTransactionDB = await BlockchainDB.create({
                BlockNo: (Math.random() + ' ').substring(2, 10) + (Math.random() + ' ').substring(2, 10),
                TransactionID: transID,
                TransactionDate: new Date(),
                TransactionAmount: amount,
                TransactionStatus: 'Completed',
                TransactionType: 'Transfer',
                TransactionDesc: description || 'Fund Transfer',
                ReceiverID: receiverUser.UserID,
                ReceiverAccountNo: receiverAccount.AccountNo,
                SenderID: senderUserId,
                SenderAccountNo: senderAccount.AccountNo
            });

            if (newTransactionDB) {
                initBc();
            }
        }

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
            balance: account.BalanceDisplay
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

app.get('/transaction-history', async (req, res) => {
    const userID = req.session.userId; 

    if (!userID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        
        const transactions = await Transaction.findAll({
            where: {
                [Sequelize.Op.or]: [
                    { SenderID: userID },
                    { ReceiverID: userID }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'Sender', // Alias for sender
                    attributes: ['FullName']
                },
                {
                    model: User,
                    as: 'Receiver', // Alias for receiver
                    attributes: ['FullName']
                }
            ],
            order: [['TransactionDate', 'DESC']] // Order by transaction date, newest first
        });

        res.status(200).json({ transactions });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({ message: 'An error occurred while fetching the transaction history' });
    }
});
 

app.get('/transaction-summary', async (req, res) => {
    try {
      const { month } = req.query; 
  
      
      const transactions = await Transaction.findAll({
        where: {
          TransactionDate: {
            [Op.between]: [new Date(`${month}-01`), new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1)]
          }
        }
      });
  
      const moneyIn = transactions
        .filter(tx => tx.TransactionType === 'Top Up')
        .reduce((acc, tx) => acc + parseFloat(tx.TransactionAmount), 0);
  
      const moneyOut = transactions
        .filter(tx => tx.TransactionType === 'Transfer')
        .reduce((acc, tx) => acc + parseFloat(tx.TransactionAmount), 0);
  
      res.json({ moneyIn, moneyOut });
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });

app.post("/user/upload-photo", async (req, res) => {
  const email = req.headers["email"];
  const contentType = req.headers["content-type"];

  console.log(email, contentType);

  let rawBody = Buffer.from([]);

  req.on("data", (chunk) => {
    rawBody = Buffer.concat([rawBody, chunk]);
  });

  if (!email) {
    return res.status(400).json({ message: "Missing email" });
  } else if (!contentType) {
    return res.status(400).json({ message: "Missing content-type" });
  }

  req.on("end", async () => {
    console.log("AWSSSSSSSSSSSSSSSSSSSSSSS",process.env.AWS_S3_BUCKET_NAME);
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${email}.jpeg`,
      Body: rawBody, // Use the collected raw body data
      ContentType: contentType,
    };

    try {
      const data = await s3.upload(params).promise();
      res.status(200).json({ message: "Image saved successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
});

const listS3Objects = async (bucketName) => {
  const params = {
    Bucket: bucketName,
  };
  try {
    const data = await s3.listObjectsV2(params).promise();
    return data.Contents.map((item) => item.Key);
  } catch (err) {
    console.error("Error listing S3 objects:", err);
    throw err;
  }
};

const compareImageWithS3 = async (
  sourceImageBucket,
  sourceImageKey,
  targetImageBucket,
  targetImageKey
) => {
  console.log(
    `COMPARING ${sourceImageKey} in ${sourceImageBucket} to ${targetImageKey} in ${targetImageBucket}`
  );
  const params = {
    SourceImage: {
      S3Object: {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Name: sourceImageKey,
      },
    },
    TargetImage: {
      S3Object: {
        Bucket: process.env.AWS_S3_COMPARE_BUCKET_NAME,
        Name: targetImageKey,
      },
    },
    SimilarityThreshold: 90, // Adjust threshold as needed
  };

  try {
    const data = await rekognition.compareFaces(params).promise();
    return data.FaceMatches;
  } catch (err) {
    console.error("Error comparing images:", err);
    return "No face detected";
  }
};


app.post(
  "/user/compare-faces",
  async (req, res, next) => {
    const contentType = req.headers["content-type"];

    let rawBody = Buffer.from([]);
    req.on("data", (chunk) => {
      rawBody = Buffer.concat([rawBody, chunk]);
    });

    req.on("end", async () => {
      let imageKey = await bcrypt.genSalt(10);
      imageKey = imageKey.replace(/\//g, "@");
      imageKey = imageKey.replace(".", "a");
      req.imageKey = `${imageKey}.jpeg`;

      const params = {
        Bucket: process.env.AWS_S3_COMPARE_BUCKET_NAME,
        Key: `${imageKey}.jpeg`,
        Body: rawBody, // Use the collected raw body data
        ContentType: contentType,
      };

      try {
        const data = await s3.upload(params).promise();
        next();
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });
  },
  async (req, res) => {
    console.log("NEXT");
    let images = await listS3Objects(process.env.AWS_S3_BUCKET_NAME);
    for (let i = 0; i < images.length; i++) {
      let img = images[i];

      let faceMatches = await compareImageWithS3(
        process.env.AWS_S3_BUCKET_NAME,
        img,
        process.env.AWS_S3_COMPARE_BUCKET_NAME,
        req.imageKey
      );
      if (faceMatches === "No face detected") {
        return res.status(403).json({ message: faceMatches });
      }
      console.log(faceMatches);
      if (faceMatches[0]?.Similarity >= 95) {
        return res.status(200).json({ email: img });
      }
    }

    return res.status(403).json({ message: "No matching faces." });
  }
);

server.listen(4000, () => {
    console.log(`Server running on http://localhost:4000`);
});
// Last line of code
app.listen(port, async () => {
    console.log(`App running on http://localhost:${port}`);

    ngrok.connect(port).then((ngrokUrl) => {
        console.log(`NGROK URL: ${ngrokUrl}`);
        ngrokopenurl = ngrokUrl
    }).catch(err => {
        console.error('Error connecting to NGROK:', err);
    })
});