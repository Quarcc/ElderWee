const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const FrozenTransaction = db.define('frozentransaction', {
    TransactionID: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    SenderAccountNo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ReceiverAccountNo: {
        type: Sequelize.STRING,
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
    Reason: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = FrozenTransaction;