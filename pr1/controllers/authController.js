const express = require('express');
const authController = express.Router();
const middlewares = require("../utils/middlewares");

authController.get("/", middlewares.restrictLoginTemplate, (request, response) => {
    response.redirect("/login");
});

authController.get("/login", middlewares.restrictLoginTemplate, (request, response) => {
    response.render("login");
});

authController.post("/procesar_login", middlewares.restrictLoginTemplate, (request, response) => {
    request.checkBody("email", "Email no valido").isEmail();
    request.checkBody("password", "Contraseña no valida").isLength({min: 4, max: 20});
    request.getValidationResult().then(result =>{
        if(result.isEmpty()){
            request.daoUsuarios.login(request.body.email, request.body.password, (err, email) => {
                if (email) {
                    request.session.loguedUser = {
                        email: email,
                        puntos: 0
                    };
                    request.session.profile = email;
                    response.redirect("/profile");
                } else {
                    //aqui redirigimos a login pero molaria hacerlo con errorMessage (lo qe viene en err) como en el ej 7
                    response.redirect("/login")
                }
            })
        }else{
            //aqui redirigimos a login pero molaria hacerlo con errorMessage (lo qe viene en err) como en el ej 7
            response.redirect("/login")
        }
    });
});

authController.get("/registro", middlewares.restrictLoginTemplate, (request, response) => {
    response.render("registro");
});

authController.post("/procesar_registro", middlewares.restrictLoginTemplate, (request, response) => {
    request.checkBody("email", "Email no valido").isEmail();
    request.checkBody("password", "Contraseña no valida").isLength({min: 4, max: 20});
    request.checkBody("complete_name", "Nombre no valido").notEmpty();
    request.checkBody("birth_date", "Fecha de nacimiento no valida").isBefore(new Date().toDateString());
    request.checkBody("gender", "Selecciona un genero").notEmpty();    
    request.getValidationResult().then(result =>{
        if(result.isEmpty()){

            let user = {
                email: request.body.email,
                nombre: request.body.complete_name,
                password: request.body.password,
                sexo: request.body.gender,
                fecha_nacimiento: request.body.birth_date,
                imagen_perfil: 'imagen.jpg',
                puntos: 50
            }
            request.daoUsuarios.nuevoUsuario(user, (err, email) => {
                if (email) {
                    request.session.loguedUser = {
                        email: email,
                        puntos: 50
                            //se pone a 50 que son los iniciales
                    };
                    request.session.profile = email;
                    response.redirect("/profile");
                } else {
                    //aqui redirigimos a registro pero molaria hacerlo con errorMessage (lo qe viene en err) como en el ej 7
                    response.redirect("/registro")
                }
            });
        }else{
            //aqui redirigimos a registro pero molaria hacerlo con errorMessage (lo qe viene en err) como en el ej 7
            response.redirect("/registro")
        }
    });
});

authController.get("/desconectar", middlewares.areYouLoged, (request, response) => {
    request.session.destroy();
    response.redirect("/login");
});

module.exports = authController;