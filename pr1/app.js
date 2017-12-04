"use strict";

const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const authController = require("./controllers/authController");
const userController = require("./controllers/userController");
const friendsController = require("./controllers/friendsController");
const questionsController = require("./controllers/questionsController");
const middlewares = require("./utils/middlewares");
const database = require("./utils/database")
const daoUsuarios = require("./DAOs/daoUsuarios");
const daoPreguntas = require("./DAOs/daoPreguntas");

let daoUsuario = new daoUsuarios.DaoUsuarios(database.pool);
let daoPregunta = new daoPreguntas.DaoPreguntas(database.pool);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "resources/views"));
app.use(express.static(path.join(__dirname, "resources/public")));
app.use(database.middlewareSession);
app.use(bodyParser.urlencoded({ extended: false }));

app.use((request, response, next) => {
    request.daoPreguntas = daoPregunta;
    request.daoUsuarios = daoUsuario;
    next();
});

app.use("", authController);

app.use("/profile", userController);

app.use("/questions", questionsController)

app.use("/friends", friendsController)

app.use("/addq", (request, response) => {
    let user = {
        email: "alberto@gmail.com",
        puntos: 200
    };
    response.render("newQuestion", { loguedUser: user });
});

app.listen(3000, (err) => {
    if (err) {
        console.error("No se pudo inicializar el servidor: " +
            err.message);
    } else {
        console.log("Servidor arrancado en el puerto 3000");
    }
});