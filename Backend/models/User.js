const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const User = db.define('user', {
    UserID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    FullName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    DOB: {
        type: Sequelize.DATE,
        allowNull: false,  
    },
    Email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
    },
    PhoneNo: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
    },
    Password: {
        type: Sequelize.STRING,
        allowNull: false,
    },


    // FaceID: {
    //     type: Sequelize.STRING,
    //     allowNull: false,
    //     defaultValue: "1"
    // }
});

module.exports = User;