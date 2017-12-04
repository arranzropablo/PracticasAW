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
                            console.log(err);
                            response.end();
                        } else {
                            response.render("friends", { requests: requests, friends: friends, loguedUser: request.session.loguedUser });
                        }
                    });

                }
            });
        } else {
            console.log(err);
            response.status(500);
            response.end();
            //aqui estaria guay redirigir a error
            //response.redirect("/error")
        }
    });
});

friendsController.post("/resolver", middlewares.areYouLoged, (request, response) => {
    let aceptada = Number(request.body.aceptada);
    let receptor = request.session.loguedUser.email;
    let emisor = request.body.email;

    request.daoUsuarios.resolverSolicitud(emisor, receptor, aceptada, (err, exito) => {
        if (err) {
            console.log(err);
            response.end();
        } else {
            response.redirect("/friends");
        }
    });
});

friendsController.get("/buscar", middlewares.areYouLoged, (request, response) => {

    let buscar = request.query.text;
    if (buscar && buscar != " ") {
        request.daoUsuarios.busquedaPorNombre(buscar, request.session.loguedUser.email, (err, resultado) => {
            if (err) {
                console.log(err);
                response.end();
            } else {
                response.render("search", { resultado: resultado, busqueda: buscar, loguedUser: request.session.loguedUser });
            }
        });
    } else {
        //aqui lo mismo, molaria renderizar con error msg
        console.log("Introduce algo que buscar");
        response.redirect("/friends");
    }
});

friendsController.post("/add/:id", middlewares.areYouLoged, (request, response) => {
    request.daoUsuarios.crearSolicitudDeAmistad(request.session.loguedUser.email, request.params.id, (err, success) => {
        if (err) {
            console.log(err);
            response.status(500);
            response.end();
        } else {
            response.redirect("/friends");
        }
    });
});

module.exports = friendsController;