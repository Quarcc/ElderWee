const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

const BannedCountries = db.define("bannedcountries", {
  CountryName: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  isBanned: {
    type: Sequelize.BOOLEAN,
    primaryKey: false,
    allowNull: false,
  },
});

module.exports = BannedCountries;
