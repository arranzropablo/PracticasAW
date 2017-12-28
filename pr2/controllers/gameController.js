const express = require('express');
const gameController = express.Router();
const path = require("path");

//TIENE QUE ESTAR IDENTIFICADA CON AUTHORIZATION, SINO 403
gameController.get("/status/:id", (request, response) => {
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

//TIENE QUE ESTAR IDENTIFICADA CON AUTHORIZATION, SINO 403
gameController.put("/new", (request, response) => {
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

//TIENE QUE ESTAR IDENTIFICADA CON AUTHORIZATION, SINO 403
gameController.put("/addUser", (request, response) => {
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

module.exports = gameController;
