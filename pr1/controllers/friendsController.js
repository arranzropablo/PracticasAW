const express = require('express');
const friendsController = express.Router();
const middlewares = require("../utils/middlewares");

friendsController.get("/", middlewares.areYouLoged, (request, response) => {
    request.daoUsuarios.getUsuario(request.session.loguedUser.email, (err, user) => {
        if (user) {
            request.session.loguedUser = {
                email: user.email,
                puntos: user.puntos
            }

            request.daoUsuarios.getSolicitudesDeAmistad(request.session.loguedUser.email, (err, requests) => {
                if (err) {
                    console.log(err);
                    response.end();
                } else {
                    request.daoUsuarios.getAmigosUsuario(request.session.loguedUser.email, (err, friends) => {
                        if (err) {
                            request.session.errors = ["Ha habido un problema", err];
                            response.redirect("/error");
                        } else {
                            response.render("friends", { requests: requests, friends: friends, loguedUser: request.session.loguedUser });
                        }
                    });

                }
            });
        } else {
            request.session.errors = ["Ha habido un problema", err];
            response.redirect("/error");
        }
    });
});

friendsController.post("/resolver", middlewares.areYouLoged, (request, response) => {
    let aceptada = Number(request.body.aceptada);
    let receptor = request.session.loguedUser.email;
    let emisor = request.body.email;

    request.daoUsuarios.resolverSolicitud(emisor, receptor, aceptada, (err, exito) => {
        if (err) {
            request.session.errors = ["Ha habido un problema", err];
            response.redirect("/error");
        } else {
            response.redirect("/friends");
        }
    });
});

friendsController.get("/buscar", middlewares.areYouLoged, (request, response) => {

    let buscar = request.query.text;
    request.checkQuery("text", "Introduce algo que buscar").notEmptySearch();
    request.getValidationResult().then(result => {
        if (result.isEmpty()) {
            request.daoUsuarios.busquedaPorNombre(buscar, request.session.loguedUser.email, (err, resultado) => {
                if (err) {
                    request.session.errors = ["Ha habido un problema", err];
                    response.redirect("/error");
                } else {
                    response.render("search", { resultado: resultado, busqueda: buscar, loguedUser: request.session.loguedUser });
                }
            });
        } else {
            request.session.errors = [];
            result.array().forEach(error =>{
                request.session.errors.push(error.msg);
            });
            response.redirect("/error");
        }
    });
});

friendsController.post("/add/:id", middlewares.areYouLoged, (request, response) => {
    request.daoUsuarios.crearSolicitudDeAmistad(request.session.loguedUser.email, request.params.id, (err, success) => {
        if (err) {
            request.session.errors = ["Ha habido un problema", err];
            response.redirect("/error");
        } else {
            response.redirect("/friends");
        }
    });
});

module.exports = friendsController;