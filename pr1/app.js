"use strict";

const path = require("path");
const config = require("./config");
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
const expressValidator = require("express-validator");
const utils = require("./utils/utils");

let daoUsuario = new daoUsuarios.DaoUsuarios(database.pool);
let daoPregunta = new daoPreguntas.DaoPreguntas(database.pool);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "resources/views"));
app.use(express.static(path.join(__dirname, "resources/public")));
app.use(database.middlewareSession);

app.use(expressValidator({
    customValidators: {
        respuestasNoVacias: respuestas => {
            return respuestas.split("\n").filter(elem => elem.length > 0 && elem.trim()).length > 0;
        },
        notEmptySearch: text => {
            return text.trim().length > 0;
        },
        validDate: date => {
            return utils.calcularEdad(new Date(), date) > 0 &&
                date.split("/")[0] >= 1 &&
                date.split("/")[0] <= 31 &&
                date.split("/")[1] >= 1 &&
                date.split("/")[1] <= 12 &&
                date.split("/")[2] > 1800;
        }
    }
}));

app.use((request, response, next) => {
    request.daoPreguntas = daoPregunta;
    request.daoUsuarios = daoUsuario;
    next();
});

app.use("", authController);

app.use("/profile", userController);

app.use("/questions", questionsController);

app.use("/friends", friendsController);

app.get("/error", (request, response) => {
    response.render("error", { errorMsgs: request.session.errors, loguedUser: request.session.loguedUser });
});

app.listen(config.port, (err) => {
    if (err) {
        console.error("No se pudo inicializar el servidor: " +
            err.message);
    } else {
        console.log("Servidor arrancado en el puerto " + config.port);
    }
});