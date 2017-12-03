const config = require("./config");
const mysql = require("mysql");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");

const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore({
    host: "91.121.109.58",
    user: "usuariop1",
    password: "accesop1",
    database: "practica1"
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