const config = require("./configLocal");
const mysql = require("mysql");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");

const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.databasePort
});

const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.databasePort
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