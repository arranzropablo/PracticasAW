const express = require('express');
const userController = express.Router();
const path = require("path");

userController.put("/new", (request, response) => {
    request.checkBody("login", "Usuario no valido").notEmptyField();
    request.checkBody("password", "Contraseña no valida").notEmptyField();
    let newUser = {
        login: request.body.login,
        password: request.body.password
    }
    request.getValidationResult().then(result => {
        if (result.isEmpty()) {
            request.daoUsuario.nuevoUsuario(newUser, (err, added) => {
                if(err){
                    response.status(500);
                    response.json(new Object());
                } else if (added) {
                    response.status(201);
                    response.json(new Object());
                } else {
                    response.status(400);
                    response.json(new Object());
                }
            })
        } else {
            response.status(400);
            response.json(result.array());
        }
    });
});

userController.post("/check", (request, response) => {
    request.checkBody("login", "Usuario no valido").notEmptyField();
    request.checkBody("password", "Contraseña no valida").notEmptyField();
    let newUser = {
        login: request.body.login,
        password: request.body.password
    }
    request.getValidationResult().then(result => {
        if (result.isEmpty()) {
            request.daoUsuario.login(newUser, (err, correct) => {
                if(err){
                    response.status(500);
                    response.json(new Object());
                } else {
                    response.status(200);
                    if (correct){
                        response.json({exists: true});
                    } else {
                        response.json({exists: false});
                    }
                }
            })
        } else {
            response.status(400);
            response.json(result.array());
        }
    });
});

//TIENE QUE ESTAR IDENTIFICADA CON AUTHORIZATION, SINO 403
userController.get("/games/:id", (request, response) => {
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

module.exports = userController;
