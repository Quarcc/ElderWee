// Bring in Sequelize
const Sequelize = require('sequelize');

// Bring in db.js which contains database name, username and password
const db = require('./db');

// Instatiates Sequelize with database parameters
const sequelize = new Sequelize(db.database, db.username, db.password, {
    host: db.host,      // Name of IP address of MySql server
    dialect: 'mysql',   // Tells sequelize MySql is used
    port: db.port,      // port where MySql listens to
    operatorsAliases: 0,

    define: {
        timestamps: false   // Don't create timestamp field in database
    },

    pool: {                 // Database system params, don't care
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
});

module.exports = sequelize;