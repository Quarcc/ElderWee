const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const AccountLogs = db.define('accountlogs', {
    LogID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    AccountNo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    LoginCoords: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    LastIPLoginCountry: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    Flagged: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
    LoginTime: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

module.exports = AccountLogs;
