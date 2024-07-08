const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Account = db.define('account', {
    AccountNo: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    Balance: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        allowNull: false
    },
    DateOpened: {
        type: Sequelize.DATE,   
        allowNull: false
    },
    AccountStatus: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // False = Unlocked, True = Locked
        allowNull: false
    },
    Scammer: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // False = Not a scammer, True = Scammer
        allowNull: false
    }
});

module.exports = Account;