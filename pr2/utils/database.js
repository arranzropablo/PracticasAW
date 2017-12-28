const config = require("../config");
const mysql = require("mysql");

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});

module.exports = {
    pool: pool
}