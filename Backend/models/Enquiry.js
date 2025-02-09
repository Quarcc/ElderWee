const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Enquiry = db.define('enquiry', {
    EnquiryID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    EnquiryDate: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    EnquiryType: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    EnquiryDetails: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    EnquiryStatus: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
});

module.exports = Enquiry;
