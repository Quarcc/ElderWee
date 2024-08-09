const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Email = db.define('email', {
    EmailID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    EmailDate: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    EmailSubject: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    EmailBody: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    EmailSent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    EmailOpened: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});

module.exports = Email;
