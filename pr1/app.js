"use strict";

const config = require("./config");
const mysql = require("mysql");
const daoUsuarios = require("./daoUsuarios");
const daoPreguntas = require("./daoPreguntas");
const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");

const ficherosEstaticos = path.join(__dirname, "public");

const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

const mysqlSession = require("express-mysql-session");
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore({
    host: "91.121.109.58",
    user: "usuariop1",
    password: "accesop1",
    database: "practica1"
});

const middlewareSession = session({
    saveUninitialized: false,
    secret: "af512FSaw4A",
    resave: false,
    store: sessionStore
});

let daoUsuario = new daoUsuarios.DaoUsuarios(pool);
let daoPregunta = new daoPreguntas.DaoPreguntas(pool);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(ficherosEstaticos));
app.use(middlewareSession);
app.use(bodyParser.urlencoded({ extended: false }));

//Middleware que restringe el acceso a login si estas logeado
function restrictLoginTemplate(request, response, next) {
    if (request.session.loguedUser) {
        response.redirect("/profile");
    } else {
        next();
    }
}
//////////////////////////////////////////////////////////////

app.get("/", restrictLoginTemplate, (request, response) => {
    response.redirect("/login");
});

app.get("/login", restrictLoginTemplate, (request, response) => {
    response.render("login");
});

app.post("/procesar_login", restrictLoginTemplate, (request, response) => {
    daoUsuario.login(request.body.email, request.body.password, (err, email) => {
        if (email) {
            request.session.loguedUser = {
                email: email,
                puntos: 0
            };
            //se pone a 0 porque no sabemos cuantos puntos tiene al hacer login, lo buscamos luego en /profile
            request.session.profile = email;
            response.redirect("/profile");
        } else {
            //aqui redirigimos a login pero molaria hacerlo con errorMessage (lo qe viene en err) como en el ej 7
            response.redirect("/login")
        }
    })
});

app.get("/registro", restrictLoginTemplate, (request, response) => {
    response.render("registro");
});

app.post("/procesar_registro", restrictLoginTemplate, (request, response) => {
    let user = {
        email: request.body.email,
        nombre: request.body.complete_name,
        password: request.body.password,
        sexo: request.body.gender,
        fecha_nacimiento: request.body.birth_date,
        imagen_perfil: 'imagen.jpg',
        puntos: 50
    }
    daoUsuario.nuevoUsuario(user, (err, email) => {
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
    })
});

//Middleware que restringe el acceso sin logear
app.use((request, response, next) => {
    if (request.session.loguedUser) {
        next();
    } else {
        response.redirect("/login");
    }
});
////////////////////////////////////////////////

app.get("/profile/:user", (request, response) => {
    request.session.profile = request.params.user;
    response.redirect("/profile");
});

app.get("/profile", (request, response) => {
    //necesitamos hacer este getusuario porque login redirige aqui despues de logear
    //y viene con 0 puntos porque no hay de donde sacarlo (antes también) por lo qe hace falta pillar los pntos
    //si quieres ahorrarte esta consulta podemos hacer que login en vez de solo correo devuelva un usuario con
    //correo y puntos (asegurarse despues de que funciona)
    daoUsuario.getUsuario(request.session.loguedUser.email, (err, user) => {
        if (user) {
            request.session.loguedUser = {
                email: user.email,
                puntos: user.puntos
            }
            daoUsuario.getUsuario(request.session.profile, (err, user) => {
                if (user) {
                    user.edad = Number(calcularEdad(new Date(), user.fecha_nacimiento));
                    response.render("profile", { user: user, loguedUser: request.session.loguedUser });
                } else {
                    console.log(err);
                    response.status(500);
                    response.end();
                    //aqui estaria guay redirigir a error
                    //response.redirect("/error")
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

app.get("/modificar_perfil", (request, response) => {
    daoUsuario.getUsuario(request.session.loguedUser.email, (err, user) => {
        if (user) {
            request.session.loguedUser = {
                email: user.email,
                puntos: user.puntos
            }
            response.render("modificar", { user: user, loguedUser: request.session.loguedUser });
        } else {
            console.log(err);
            response.status(500);
            response.end();
            //aqui estaria guay redirigir a error
            //response.redirect("/error")
        }
    });
});

app.get("/questions", (request, response) => {
    let preguntasRandom = [];
    daoPregunta.getPreguntas(request.session.loguedUser.email, (err, preguntas) => {
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

app.get("/getpregunta/:id", (request, response) => {
    let id = request.params.id;

    daoPregunta.getPregunta(id, (err, pregunta) => {
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

app.get("/addQuestion", (request, response) => {
    response.render("questions", { loguedUser: request.session.loguedUser });
});

app.post("/modificar", (request, response) => {
    let user = {
        email: request.body.email,
        nombre: request.body.complete_name,
        password: request.body.password,
        sexo: request.body.gender,
        fecha_nacimiento: request.body.birth_date,
        imagen_perfil: 'imagen.jpg',
    }
    daoUsuario.modificarUsuario(user, (err, email) => {
        if (email) {
            request.session.profile = email;
            response.redirect("/profile");
        } else {
            //aqui redirigimos a modificar perfil pero molaria hacerlo con errorMessage (lo qe viene en err) como en el ej 7
            response.redirect("/modificar_perfil")
        }
    })
});

app.get("/friends", (request, response) => {

    daoUsuario.getUsuario(request.session.loguedUser.email, (err, user) => {
        if (user) {
            request.session.loguedUser = {
                email: user.email,
                puntos: user.puntos
            }

            daoUsuario.getSolicitudesDeAmistad(request.session.loguedUser.email, (err, requests) => {
                if (err) {
                    console.log(err);
                    response.end();
                } else {
                    daoUsuario.getAmigosUsuario(request.session.loguedUser.email, (err, friends) => {
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

app.post("/resolver_solicitud", (request, response) => {
    let aceptada = Number(request.body.aceptada);
    let receptor = request.session.loguedUser.email;
    let emisor = request.body.email;

    daoUsuario.resolverSolicitud(emisor, receptor, aceptada, (err, exito) => {
        if (err) {
            console.log(err);
            response.end();
        } else {
            response.redirect("/friends");
        }
    });
});


app.get("/buscar", (request, response) => {

    let buscar = request.query.text;
    if (buscar && buscar != " ") {
        daoUsuario.busquedaPorNombre(buscar, request.session.loguedUser.email, (err, resultado) => {
            //preguntar si solo tenemos qe mostrar los usuarios a los que podemos hacer una petición

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

app.post("/addFriend/:id", (request, response) => {
    daoUsuario.crearSolicitudDeAmistad(request.session.loguedUser.email, request.params.id, (err, success) => {
        if (err) {
            console.log(err);
            response.status(500);
            response.end();
        } else {
            response.redirect("/friends");
        }
    });
});

app.get("/desconectar", (request, response) => {
    request.session.destroy();
    response.redirect("/login");
});

app.listen(3000, (err) => {
    if (err) {
        console.error("No se pudo inicializar el servidor: " +
            err.message);
    } else {
        console.log("Servidor arrancado en el puerto 3000");
    }
});

function calcularEdad(currentDate, birth) {
    let birthDate = birth.split("/");
    if (birthDate[1] < (currentDate.getMonth() + 1)) {
        return currentDate.getFullYear() - birthDate[2];
    } else if (birthDate[1] == (currentDate.getMonth() + 1)) {
        if (birthDate[0] <= currentDate.getDate()) {
            return currentDate.getFullYear() - birthDate[2];
        } else {
            return currentDate.getFullYear() - birthDate[2] - 1;
        }
    } else if (birthDate[1] > (currentDate.getMonth() + 1)) {
        return currentDate.getFullYear() - birthDate[2] - 1;
    }
}