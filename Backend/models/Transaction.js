const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Transaction = db.define('transaction', {
    TransactionID: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    TransactionDate: {
        type: Sequelize.DATE,
        allowNull: false
    },
    TransactionAmount: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    TransactionStatus: {
        type: Sequelize.STRING, // Returned, Pending, Success
        allowNull: false
    },
    TransactionType: {
        type: Sequelize.STRING, // Withdrawal, Deposit
        allowNull: false
    },
    TransactionDesc: {
        type: Sequelize.STRING,
        allowNull: true
    },
    ReceiverID: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    ReceiverAccountNo: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

module.exports = Transaction;