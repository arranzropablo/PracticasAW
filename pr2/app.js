"use strict";

const express = require("express");
const path = require("path");
const config = require("./config");
const bodyParser = require("body-parser");
const gameController = require("./controllers/gameController");
const userController = require("./controllers/userController");
const database = require("./utils/database")
const daoUsuarios = require("./DAOs/daoUsuarios");
const daoJuegos = require("./DAOs/daoJuegos");
const app = express();
const expressValidator = require("express-validator");

let daoUsuario = new daoUsuarios.DaoUsuarios(database.pool);
let daoJuego = new daoJuegos.DaoJuegos(database.pool);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(expressValidator({
    customValidators: {
        notEmptyField: text => {
            return text.trim().length > 0;
        }
    }
}));

app.use((request, response, next) => {
    request.daoUsuario = daoUsuario;
    request.daoJuegos = daoJuego;
    next();
});

app.use("/user", userController);

app.use("/game", gameController);

app.listen(config.port, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});