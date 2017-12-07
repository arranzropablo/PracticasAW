const express = require('express');
const questionsController = express.Router();
const middlewares = require("../utils/middlewares");

questionsController.get("/", middlewares.areYouLoged, (request, response) => {
    let preguntasRandom = [];
    request.daoPreguntas.getPreguntas(request.session.loguedUser.email, (err, preguntas) => {
        if (err) {
            console.log(err);
            response.status(500);
            response.end();
            //aqui estaria guay redirigir a error
            //response.redirect("/error")
        } else {
            if (preguntas.length < 6) {
                preguntas.forEach(pregunta => {
                    preguntasRandom.push(pregunta);
                });
            } else {
                let randomIndexAdded = [];
                let i;
                for (i = 0; i < 5; i++) {
                    let random;
                    do {
                        random = Math.floor(Math.random() * (preguntas.length - 0)) + 0;
                    } while (randomIndexAdded.includes(Number(random)))
                    randomIndexAdded.push(random);
                    preguntasRandom.push(preguntas[random]);
                }
            }
            response.render("questions", { loguedUser: request.session.loguedUser, resultado: preguntasRandom });
        }
    });
});

questionsController.get("/nueva", middlewares.areYouLoged, (request, response) => {
    response.render("newQuestion", { loguedUser: request.session.loguedUser });
});

questionsController.get("/nuevapregunta", middlewares.areYouLoged, (request, response) => {
    let pregunta = {
        texto: request.query.pregunta,
        respuestas: request.query.respuestas.split("\n")
    }
    pregunta.numrespuestas = pregunta.respuestas.length;
    request.daoPreguntas.anadirPregunta(pregunta, (err) => {
        if (err) {
            console.log(err);
            response.status(500);
            response.end();
        } else {
            response.redirect("/questions");
        }
    });

});

questionsController.get("/contestarpregunta", middlewares.areYouLoged, (request, response) => {
    let idPregunta = Number(request.query.pregunta);
    let otra;
    let idRespuesta;
    if (request.query.respuesta === "otra") {
        otra = request.query.otro;
        idRespuesta = Number(request.query.numRespuestas) + 1;
    } else {
        idRespuesta = Number(request.query.respuesta);
    }
    let email = request.session.loguedUser.email;

    request.daoPreguntas.contestarPregunta(email, idPregunta, idRespuesta, otra, err => {
        if (err) {
            console.log(err);
            response.status = 500;
            response.end();
        } else {
            response.redirect("/questions");
        }
    });
});

questionsController.get("/pregunta/:id", middlewares.areYouLoged, (request, response) => {
    let id = Number(request.params.id);
    let email = request.session.loguedUser.email;

    request.daoPreguntas.getPreguntaSinRespuestas(email, id, (err, pregunta) => {
        if (err) {
            console.log(err);
            response.status(500);
            response.end();
        } else {
            request.daoPreguntas.getAdivinados(email, id, (err, respuestas) => {
                if (err) {
                    console.log(err);
                    response.status(500);
                    response.end();
                } else {
                    response.render("questionView", { loguedUser: request.session.loguedUser, question: pregunta, respuestas: respuestas });
                }
            });
        }
    });

});

questionsController.post("/adivinarpregunta", middlewares.areYouLoged, (request, response) => {
    let friend = request.body.email;
    let pregunta = request.body.pregunta;

    request.daoPreguntas.getPregunta(pregunta, (err, pregunta) => {
        if (err) {
            console.log(err);
            response.status(500);
            response.end();
        } else {
            response.render("adivinarQuestion", {
                loguedUser: request.session.loguedUser,
                question: pregunta,
                email: friend
            });
        }
    });
});

questionsController.post("/resolveradivinar", middlewares.areYouLoged, (request, response) => {
    let pregunta = request.body.pregunta;
    let friend = request.body.friend;
    let respuesta = request.body.respuesta;
    let email = request.session.loguedUser.email;

    request.daoPreguntas.getRespuestaUsuario(friend, pregunta, (err, callback) => {
        acertada = Number(respuesta) == callback;
        request.daoPreguntas.adivinarRespuesta(email, friend, pregunta, acertada, (err, callback) => {
            if (err) {
                console.log(err);
                response.status(500);
                response.end();
            } else {
                response.redirect("/questions/pregunta/" + pregunta);
            }
        });
    });

});

questionsController.get("/vistapregunta/:id", middlewares.areYouLoged, (request, response) => {
    let id = Number(request.params.id);

    request.daoPreguntas.getPregunta(id, (err, pregunta) => {
        if (err) {
            console.log(err);
            response.status = 500;
            response.end();
        } else {
            response.render("question", { loguedUser: request.session.loguedUser, question: pregunta });
        }
    })


});

module.exports = questionsController;