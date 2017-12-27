const express = require("express");
const path = require("path");
const config = require("./config");
const bodyParser = require("body-parser");
const app = express();
const expressValidator = require("express-validator");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(expressValidator());

app.put("/user/new", (request, response) => {
    request.body.user;
    request.body.password;
    //add user and password to database
    //si no hay error
    response.status(201);
    //si el usuario ya existia o errores d validacion
    response.status(400);
    //si hay error de bd
    response.status(500);

    //finally:
    response.json(JSON.stringify(new Object()));
});

app.get("/user/check", (request, response) => {
    request.body.user;
    request.body.password;
    //busca en bd ese usuario y password
    //si no hay error
    response.status(200);
        //si existe
        response.json(JSON.stringify({exists: true}));
        //si no existe
        response.json(JSON.stringify({exists: false}));
    //si hay error
    response.status(500);
});

//TODAS LAS DE DEBAJO DE AQUI TIENEN QUE ESTAR IDENTIFICADAS CON AUTHORIZATION, SINO 403

app.get("/user/games/:id", (request, response) => {
    request.params.id;
    //busca en bd las partidas del usuario y las guarda en un array
    let listaPartidas = [];
    //si no hay error
    response.status(200);
    response.json(JSON.stringify(listaPartidas));
    //si hay error
    response.status(500);
    response.json(JSON.stringify(new Object()));
});

app.get("/game/status/:id", (request, response) => {
    request.params.id;
    //busca en bd los jugadores de una partida
    let players = [];
    //si no hay error
    response.status(200);
    response.json(JSON.stringify(players));
    //si la partida no existe
    response.status(404);
    response.json(JSON.stringify(new Object()));
    //si hay error
    response.status(500);
    response.json(JSON.stringify(new Object()));
});

app.put("/game/new", (request, response) => {
    request.body.name;
    //inserta en bd la partida con ese nombre
    //inserta el creador de la partida como jugador de la partida
    //si no hay error
    response.status(201);
    //si hay error
    response.status(500);

    //finally:
    response.json(JSON.stringify(new Object()));
});

app.put("/game/addUser", (request, response) => {
    request.body.gameId;
    request.body.userId;
    //inserta el usuario en la partida
    //si no hay error
    response.status(201);
    //si la partida esta llena
    response.status(400);
    //si la partida no existe
    response.status(404);
    //si hay error
    response.status(500);

    //finally:
    response.json(JSON.stringify(new Object()));
});

app.listen(config.port, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});