const express = require('express');
const userController = express.Router();
const middlewares = require("../utils/middlewares");
const utils = require("../utils/utils");
const multer = require("multer");
const factoryMulter = multer();

userController.get("/user/:user", middlewares.areYouLoged, (request, response) => {
    request.session.profile = request.params.user;
    response.redirect("/profile");
});

userController.get("/", middlewares.areYouLoged, (request, response) => {
    request.daoUsuarios.getUsuario(request.session.loguedUser.email, (err, user) => {
        if (user) {
            request.session.loguedUser = {
                email: user.email,
                puntos: user.puntos
            }
            request.daoUsuarios.getUsuario(request.session.profile, (err, user) => {
                if (user) {
                    user.edad = Number(utils.calcularEdad(new Date(), user.fecha_nacimiento));
                    response.render("profile", { user: user, loguedUser: request.session.loguedUser });
                } else {
                    request.session.errors = ["Ha habido un problema", err];
                    response.redirect("/error");
                }
            });
        } else {
            request.session.errors = ["Ha habido un problema", err];
            response.redirect("/error");
        }
    });
});

userController.get("/modificar", middlewares.areYouLoged, (request, response) => {
    request.daoUsuarios.getUsuario(request.session.loguedUser.email, (err, user) => {
        if (user) {
            request.session.loguedUser = {
                email: user.email,
                puntos: user.puntos
            }
            response.render("modificar", { user: user, loguedUser: request.session.loguedUser });
        } else {
            request.session.errors = ["Ha habido un problema", err];
            response.redirect("/error");
        }
    });
});

userController.post("/modificar", middlewares.areYouLoged, factoryMulter.none(), (request, response) => {
    request.checkBody("email", "Email no valido").isEmail();
    request.checkBody("password", "Contraseña no valida").isLength({ min: 4, max: 20 });
    request.checkBody("complete_name", "Nombre no valido").notEmpty();
    request.checkBody("birth_date", "Fecha de nacimiento no valida").validDate();
    request.checkBody("gender", "Selecciona un genero").notEmpty();
    request.getValidationResult().then(result => {
        if (result.isEmpty()) {
            let user = {
                email: request.body.email,
                nombre: request.body.complete_name,
                password: request.body.password,
                sexo: request.body.gender,
                fecha_nacimiento: request.body.birth_date,
                imagen_perfil: 'imagen.jpg',
            }
            request.daoUsuarios.modificarUsuario(user, (err, email) => {
                if (email) {
                    request.session.profile = email;
                    response.redirect("/profile");
                } else {
                    request.session.errors = ["Ha habido un problema", err];
                    response.redirect("/error");
                }
            })
        } else {
            request.session.errors = [];
            result.array().forEach(error => {
                request.session.errors.push(error.msg);
            });
            response.redirect("/error");
        }
    });
});

module.exports = userController;