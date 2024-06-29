const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Announcement = db.define('announcement', {
    AnnouncementID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    AnnouncementDate: {
        type: Sequelize.DATE,
        allowNull: false
    },
    AnnouncementDetail: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Announcement;