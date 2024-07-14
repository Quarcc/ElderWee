const mySQLDB = require('./DBConfig');
const User = require('../models/User');
const Account = require('../models/Account');
const Announcement = require('../models/Announcement');
const BlockchainDB = require('../models/Blockchain');
const Enquiry = require('../models/Enquiry');
const FrozenTransaction = require('../models/FrozenTransaction')
const Geolocation = require('../models/Geolocation');
const Transaction = require('../models/Transaction');

const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('ElderWee database connected');
        })
        .then(() => {
            User.hasMany(Account, { foreignKey: 'UserID' });
            User.hasMany(Transaction, { foreignKey: 'SenderID' });
            Account.hasMany(Transaction, { foreignKey: 'SenderAccountNo' });
            User.hasMany(BlockchainDB, { foreignKey: 'SenderID' });
            Account.hasMany(BlockchainDB, { foreignKey: 'SenderAccountNo' });
            User.hasMany(Enquiry, { foreignKey: 'UserID' });
            Account.hasMany(Enquiry, { foreignKey: 'AccountNo' });
            User.hasMany(Announcement, { foreignKey: 'UserID' });
            Account.hasMany(Announcement, { foreignKey: 'AccountNo' });
            Account.hasMany(Geolocation, { foreignKey: 'AccountNo' });
            mySQLDB.sync({ // Creates table if none exists
                force: drop
            }).then(() => {
                console.log('Create tables if none exists')
            }).catch(err => console.log(err))
        })
        .catch(err => console.log('Error: ' + err));
};

module.exports = { setUpDB };