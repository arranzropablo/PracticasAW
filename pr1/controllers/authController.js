const express = require('express');
const path = require("path");
const authController = express.Router();
const middlewares = require("../utils/middlewares");
const multer = require("multer");
const factoryMulter = multer({ dest: "./uploads" });

authController.get("/", middlewares.restrictLoginTemplate, (request, response) => {
    response.redirect("/login");
});

authController.get("/login", middlewares.restrictLoginTemplate, (request, response) => {
    response.render("login");
});

authController.post("/procesar_login", middlewares.restrictLoginTemplate, factoryMulter.none(), (request, response) => {
    request.checkBody("email", "Email no valido").isEmail();
    request.checkBody("password", "Contraseña no valida").isLength({ min: 4, max: 20 });
    request.getValidationResult().then(result => {
        if (result.isEmpty()) {
            request.daoUsuarios.login(request.body.email, request.body.password, (err, email) => {
                if (email) {
                    request.session.loguedUser = {
                        email: email,
                        puntos: 0
                    };
                    request.session.profile = email;
                    response.redirect("/profile");
                } else {
                    request.session.errors = ["Ha habido un problema durante el login", err];
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

authController.get("/registro", middlewares.restrictLoginTemplate, (request, response) => {
    response.render("registro");
});

authController.post("/procesar_registro", middlewares.restrictLoginTemplate, factoryMulter.single("profile_image"), (request, response) => {
    request.checkBody("email", "Email no valido").isEmail();
    request.checkBody("password", "Contraseña no valida").isLength({ min: 4, max: 20 });
    request.checkBody("complete_name", "Nombre no valido").notEmpty();
    request.checkBody("birth_date", "Fecha de nacimiento no valida").validDate();
    request.checkBody("gender", "Selecciona un genero").notEmpty();
    request.getValidationResult().then(result => {
        if (result.isEmpty()) {
            let imagen = null;
            if (request.file) {
                imagen = request.file.path;
            }
            let user = {
                email: request.body.email,
                nombre: request.body.complete_name,
                password: request.body.password,
                sexo: request.body.gender,
                fecha_nacimiento: request.body.birth_date,
                imagen_perfil: imagen,
                puntos: 0
            }
            request.daoUsuarios.nuevoUsuario(user, (err, email) => {
                if (email) {
                    request.session.loguedUser = {
                        email: email,
                        puntos: 50
                    };
                    request.session.profile = email;
                    response.redirect("/profile");
                } else {
                    request.session.errors = ["Ha habido un problema durante el registro", err];
                    response.redirect("/error");
                }
            });
        } else {
            request.session.errors = [];
            result.array().forEach(error => {
                request.session.errors.push(error.msg);
            });
            response.redirect("/error");
        }
    });
});

authController.get("/desconectar", middlewares.areYouLoged, (request, response) => {
    request.session.destroy();
    response.redirect("/login");
});

module.exports = authController;