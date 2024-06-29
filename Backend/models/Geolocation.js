const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Location = db.define('geolocation', {
    LocationID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    Latitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    Longitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    LastIPLoginCountry: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

module.exports = Location;
