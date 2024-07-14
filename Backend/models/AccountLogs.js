const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const AccountLogs = db.define('accountlogs', {
    AccountNo: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    LoginCoords:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    LastIPLoginCountry: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    Flagged:{
        type: Sequelize.BOOLEAN,
        allowNull:false,
    }
});

module.exports = AccountLogs;