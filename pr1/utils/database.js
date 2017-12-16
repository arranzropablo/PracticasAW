const config = require("../config");
const mysql = require("mysql");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});

const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});

const middlewareSession = session({
    saveUninitialized: false,
    secret: "af512FSaw4A",
    resave: false,
    store: sessionStore
});

module.exports = {
    middlewareSession: middlewareSession,
    pool: pool
}