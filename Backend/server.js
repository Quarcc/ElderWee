// Import dependencies
const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bodyParser = require("body-parser");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");

// Database
const elderwee = require("./config/DBConnection");
const db = require("./config/db");
const { Op } = require("sequelize");

const User = require("./models/User");
const Account = require("./models/Account");
const Transaction = require("./models/Transaction");
const BlockchainDB = require("./models/Blockchain");
const Location = require("./models/Geolocation");
const AccountLog = require("./models/AccountLogs");
const BannedCountries = require("./models/BannedCountries");

// send mail
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Blockchain module
const { Block, Blockchain } = require("./blockchain/blockchain");
const { countReset } = require("console");

const app = express();

let port = 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000", //specify domains that can call your API
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

elderwee.setUpDB(false); // true will drop all tables and create again, false will create new tables without losing old ones, true will also delete all existing data

const options = {
  host: db.host,
  port: db.port,
  user: db.username,
  password: db.password,
  database: db.database,
};
const sessionStore = new MySQLStore(options);
app.use(
  session({
    key: "session_cookie_name",
    secret: "session_cookie_secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

let Bc = new Blockchain();

const formatDate = (dateString) => {
  const date = new Date(dateString);

  const day = date.getDate();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

const initBc = async () => {
  try {
    // Fetch data from database
    const BlockchainDBData = await BlockchainDB.findAll({
      attributes: [
        "BlockNo",
        "TransactionID",
        "TransactionDate",
        "TransactionAmount",
        "TransactionStatus",
        "TransactionType",
        "TransactionDesc",
        "ReceiverID",
        "ReceiverAccountNo",
        "SenderID",
        "SenderAccountNo",
      ],
      order: [["TransactionID", "ASC"]],
    });

    // Create a map to store transactions grouped by TransactionID
    const transactionMap = new Map();

    // Group transactions by TransactionID
    BlockchainDBData.forEach((data) => {
      if (!transactionMap.has(data.TransactionID)) {
        transactionMap.set(data.TransactionID, []);
      }
      transactionMap.get(data.TransactionID).push(data);
    });

    // Process transactions and add to blockchain
    transactionMap.forEach((transactions) => {
      // Sort transactions by TransactionStatus order: Pending, Completed, Returned
      transactions.sort((a, b) => {
        const statusOrder = { Pending: 1, Completed: 2, Returned: 3 };
        return (
          statusOrder[a.TransactionStatus] - statusOrder[b.TransactionStatus]
        );
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
            SenderAccountNo: data.SenderAccountNo,
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

// === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE === ALL OFFICIAL CODES HERE ===


// API endpoint to get active accounts
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

// API endpoint to get flagged accounts
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

app.get("/api/displayallaccounts", async (req, res) => {
  try {
    const accounts = await Account.findAll();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: message });
  }
});

app.get("/api/accounts", async (req, res) => {
  try {
    const accounts = await Account.findAll();
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ error: message });
  }
});


app.get("/api/Blockchain", async (req, res) => {
  try {
    res.status(200).send(JSON.stringify(Bc, null, 2));
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/allTransactions", async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.json(transactions);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/transactionCount", async (req, res) => {
  try {
    const transactionCount = await Transaction.count();
    res.json({ count: transactionCount });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/api/transaction/rollback/id/:transactionID", async (req, res) => {
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
    const transaction = await Transaction.findOne({
      where: { TransactionID: transactionID },
    });
    if (transaction) {
      transactionDate = transaction.TransactionDate;
      transactionAmt = transaction.TransactionAmount;
      transactionType = transaction.TransactionType;
      transactionDesc = transaction.TransactionDesc;
      receiverid = transaction.ReceiverID;
      receiveraccountnum = transaction.ReceiverAccountNo;
      senderid = transaction.SenderID;
      senderaccountnum = transaction.SenderAccountNo;
      transaction.TransactionStatus = "Returned";
      await transaction.save();
      res.status(200).json({ message: "Transaction updated successfully" });
    } else {
      res.status(404).json({ error: "Transaction not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

  const newTransactionDB = await BlockchainDB.create({
    BlockNo:
      (Math.random() + " ").substring(2, 10) +
      (Math.random() + " ").substring(2, 10),
    TransactionID: transactionID,
    TransactionDate: transactionDate,
    TransactionAmount: transactionAmt,
    TransactionStatus: "Returned",
    TransactionType: transactionType,
    TransactionDesc: transactionDesc,
    ReceiverID: receiverid,
    ReceiverAccountNo: receiveraccountnum,
    SenderID: senderid,
    SenderAccountNo: senderaccountnum,
  });

  if (newTransactionDB) {
    initBc();
  }
});

app.get("/api/totalTransactionAmount", async (req, res) => {
  try {
    const totalAmount = await Transaction.sum("TransactionAmount");
    res.json({ totalAmount });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/transaction/weeklyTransaction", async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 13);

    const transactions = await Transaction.findAll({
      where: {
        TransactionDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [["TransactionDate", "ASC"]],
    });

    // Group accounts by date
    const groupedData = transactions.reduce((acc, transaction) => {
      const date = transaction.TransactionDate.toISOString().split("T")[0];
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
      const dateString = date.toISOString().split("T")[0];

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

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/users/email/:email", async (req, res) => {
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
});

app.get("/api/users/:userID", async (req, res) => {
  const { userID } = req.params;
  try {
    const user = await User.findOne({ where: { UserID: userID } });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/userCount", async (req, res) => {
  try {
    const userCount = (await User.count()) - 1;
    res.json({ count: userCount });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/accountlogs", async (req, res) => {
  try {
    const logs = await AccountLog.findAll();
    if (logs) {
      res.json(logs);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/api/users/:userID", async (req, res) => {
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
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/users/:userID", async (req, res) => {
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
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/accounts/log", async (req, res) => {
  const { AccountNo, LoginCoords, LastIPLoginCountry, Flagged, LoginTime } =
    req.body;
  //res.status(200).json({"message":"message"});

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

app.get("/api/accounts", async (req, res) => {
  try {
    const accounts = await Account.findAll({
      order: [["UserID", "ASC"]],
    });
    res.json(accounts);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/accounts/userid/:userid", async (req, res) => {
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
});

app.put("/api/accounts/:accountNo", async (req, res) => {
  const { accountNo } = req.params;
  const { AccountStatus, Scammer } = req.body;
  try {
    const account = await Account.findOne({ where: { AccountNo: accountNo } });
    if (account) {
      account.AccountStatus = AccountStatus;
      account.Scammer = Scammer;
      await account.save();
      res.status(200).json({ message: "Account updated successfully" });
    } else {
      res.status(404).json({ error: "Account not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      return res
        .status(200)
        .json({
          message: `${countryName} ${
            isBanned ? "banned" : "unbanned"
          } successfully.`,
        });
    } else {
      const newCountry = await BannedCountries.create({
        CountryName: countryName,
        isBanned: isBanned,
      });

      return res
        .status(200)
        .json({ message: `${countryName} added to banlist.` });
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.get('/api/countries/banned', async(req,res)=>{
    try{
        let banList = await BannedCountries.findAll({where:{isBanned:1}});
        return res.status(200).json(banList);
    }
    catch(err){
        return res.status(500).json({err});
    }
})

app.get("/api/accounts/weekly", async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 13);

    const accounts = await Account.findAll({
      where: {
        DateOpened: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [["DateOpened", "ASC"]],
    });

    // Group accounts by date
    const groupedData = accounts.reduce((acc, account) => {
      const date = account.DateOpened.toISOString().split("T")[0];
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
      const dateString = date.toISOString().split("T")[0];

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

app.post("/signup", async (req, res) => {
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

    // Respond with the newly created user object
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { Email: email } });

    if (!user || user.Password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = user.UserID;
    // You can customize what data to send back to the frontend upon successful login
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "justprepco@gmail.com",
    pass: "uhru lnfq oalh duxz", // Use your app-specific password here
  },
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { Email: email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    // Save the token to the user record in the database
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    const mailOptions = {
      from: "justprepco@gmail.com",
      to: user.Email,
      subject: "Password Reset",
      html: `<p>You requested a password reset</p>
                   <p>Click this <a href="${resetLink}">link</a> to set a new password.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Error sending email" });
      }
      res.status(200).json({ message: "Password reset link sent" });
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // const hashedPassword = await bcrypt.hash(password, 10); // Comment this line out for now
    user.Password = password; // Save the plain text password for now
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Last line of code
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
