"use strict";

const express = require("express");
const path = require("path");
const config = require("./config");
const bodyParser = require("body-parser");
const database = require("./utils/database")
const daoUsuarios = require("./DAOs/daoUsuarios");
const daoJuegos = require("./DAOs/daoJuegos");
const expressValidator = require("express-validator");
var passport = require("passport");
var passportHTTP = require("passport-http");
var https = require("https");
var fs = require("fs");
const app = express();

var private_key = fs.readFileSync("./" + config.private_key);
var certificado = fs.readFileSync("./" + config.certificate);

let daoUsuario = new daoUsuarios.DaoUsuarios(database.pool);
let daoJuego = new daoJuegos.DaoJuegos(database.pool);

app.use(express.static(path.join(__dirname, "resources/public")));
app.use(bodyParser.json());
app.use(expressValidator({
    customValidators: {
        notEmptyField: text => {
            return text.trim().length > 0;
        }
    }
}));

app.use(passport.initialize());
passport.use(new passportHTTP.BasicStrategy(({ realm: "Unauthorized access" },
    function(user, password, callback) {
        let checkUser = {
            login: user,
            password: password
        }
        daoUsuario.login(checkUser, (err, correct) => {
            if (!err) {
                if (correct) {
                    callback(null, checkUser.login);
                } else {
                    callback(null, false);
                }
            }
        });
    })));

app.use((request, response, next) => {
    request.daoUsuario = daoUsuario;
    request.daoJuegos = daoJuego;
    next();
});

const gameController = require("./controllers/gameController")(express, passport);
const userController = require("./controllers/userController")(express, passport);
const authController = require("./controllers/authController")(express);

app.use("", authController);

app.use("/user", userController);

app.use("/game", gameController);

var servidor = https.createServer({key: private_key, cert: certificado}, app);

servidor.listen(config.httpsPort, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor https escuchando en puerto ${config.httpsPort}.`);
    }
});

app.listen(config.port, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor http escuchando en puerto ${config.port}.`);
    }
});