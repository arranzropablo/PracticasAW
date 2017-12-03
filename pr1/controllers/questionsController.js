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

questionsController.get("/:id", middlewares.areYouLoged, (request, response) => {
    let id = request.params.id;

    request.daoPreguntas.getPregunta(id, (err, pregunta) => {
        if (err) {
            console.log(err);
            response.status = 500;
            response.end();
        } else {
            //response.render("question", {question: pregunta});
            response.end("correcto");
        }
    })

});

questionsController.get("/add", middlewares.areYouLoged, (request, response) => {
    response.render("questions", { loguedUser: request.session.loguedUser });
});

module.exports = questionsController;