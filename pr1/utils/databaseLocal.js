const config = require("./configLocal");
const mysql = require("mysql");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");

const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port
});

const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore({
    host: "localhost",
    user: "root",
    password: "",
    database: "practica1",
    port: 3307
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