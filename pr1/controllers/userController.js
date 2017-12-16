const express = require('express');
const userController = express.Router();
const middlewares = require("../utils/middlewares");
const utils = require("../utils/utils");
const path = require("path");
const multer = require("multer");
const factoryMulter = multer({ dest: path.join(__dirname, "../uploads") });


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
                fecha_nacimiento: request.body.birth_date
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

userController.get("/imagen/:id", middlewares.areYouLoged, (request, response) => {
    request.daoUsuarios.getUsuario(request.params.id, (err, usuario) => {
        if (err) {
            request.session.errors = ["Ha habido un problema", err];
            response.redirect("/error"); //ruta
        } else {
            let ruta;
            if (usuario.imagen_perfil) {
                ruta = path.join(__dirname, "../uploads", usuario.imagen_perfil);
            } else {
                ruta = path.join(path.parse(path.parse(__dirname).dir).dir, "pr1/resources/public/icons/Zombie PVZ-01.png");
            }
            response.sendFile(ruta);
        }
    });
});

userController.get("/imagensubida/:id", middlewares.areYouLoged, (request, response) => {
    let ruta;
    ruta = path.join(__dirname, "../uploads", request.params.id);
    response.sendFile(ruta);
});

userController.get("/imagenes/:email", middlewares.areYouLoged, (request, response) => {
    request.session.profile = request.params.email;
    response.redirect("/profile/imagenes");
});

userController.get("/imagenes", middlewares.areYouLoged, (request, response) => {
    let email = request.session.profile;
    request.daoUsuarios.getImagenesSubidas(email, (err, imagenes) => {
        if (err) {
            request.session.errors = ["Ha habido un problema", err];
            response.redirect("/error"); //ruta
        } else {
            response.render("imagenes", { loguedUser: request.session.loguedUser, email: email, imagenes: imagenes });
        }
    });
});

userController.post("/nuevaimagen", middlewares.areYouLoged, factoryMulter.single("image"), (request, response) => {
    if (request.session.loguedUser.puntos >= 100) {
        if (request.file) {
            let imagen = request.file.path.split("uploads")[1].replace("\\", "").trim();
            let descripcion = request.body.descripcion;
            request.daoUsuarios.nuevaImagenUsuario(request.session.loguedUser.email, imagen, descripcion, err => {
                if (err) {
                    request.session.errors = ["Ha habido un problema", err];
                    response.redirect("/error"); //ruta
                } else {
                    request.daoUsuarios.sumarPuntos(request.session.loguedUser.email, -100, (err, puntos) => {
                        request.session.loguedUser.puntos += puntos;
                        response.redirect("/profile/imagenes");
                    });
                }
            });
        } else {
            request.session.errors = ["Ha habido un problema", "No has subido la imagen"];
            response.redirect("/error"); //ruta
        }
    } else {
        request.session.errors = ["Ha habido un problema", "No tienes suficientes puntos para subir la imagen (100 puntos)"];
        response.redirect("/error"); //ruta
    }
});

module.exports = userController;