"use strict";

const config = require("./config");
const mysql = require("mysql");
const daoUsuarios = require("./daoUsuarios");
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

//Plantillas

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(ficherosEstaticos));
app.use(middlewareSession);
app.use(bodyParser.urlencoded({ extended: false }));

//Middleware que restringe el acceso a login si estas logeado
function restrictLoginTemplate(request, response, next) {
    if (app.locals.loguedUser) {
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
            app.locals.loguedUser ={
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
            app.locals.loguedUser = {
                email: email,
                puntos: 50
                //se pone a 50 que son los iniciales
            };
            //preguntar si esta bien qe el logued user este siempre en local
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
    if (app.locals.loguedUser) {
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
    daoUsuario.getUsuario(app.locals.loguedUser.email, (err, user) => {
        if (user) {
            app.locals.loguedUser ={
                email: user.email,
                puntos: user.puntos
            }
            daoUsuario.getUsuario(request.session.profile, (err, user) => {
                if (user) {
                    user.edad = Number(calcularEdad(new Date(), user.fecha_nacimiento));
                    response.render("profile", { user: user });
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

app.get("/friends", (request, response) => {
    
    daoUsuario.getUsuario(app.locals.loguedUser.email, (err, user) => {
        if (user) {
            app.locals.loguedUser ={
                email: user.email,
                puntos: user.puntos
            }
            
            daoUsuario.getSolicitudesDeAmistad(app.locals.loguedUser.email, (err, requests) => {
                if (err) {
                    console.log(err);
                    response.end();
                } else {
                    daoUsuario.getAmigosUsuario(app.locals.loguedUser.email, (err, friends) => {
                        if (err) {
                            console.log(err);
                            response.end();
                        } else {
                            response.render("friends", { requests: requests, friends: friends });
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
    let receptor = app.locals.loguedUser.email;
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
    if(buscar){
        daoUsuario.busquedaPorNombre(buscar, app.locals.loguedUser.email, (err, resultado) => {
            //hacer que esta funcion no muestre los usuarios que ya tenemos agregados o pendientes
            if (err) {
                console.log(err);
                response.end();
            } else {
                response.render("search", { resultado: resultado, busqueda: buscar });
            }
        });
    }
    else{
        //aqui lo mismo, molaria renderizar con error msg
        console.log("Introduce algo que buscar");
    }
});

app.post("/addFriend/:id", (request, response) => {
    daoUsuario.crearSolicitudDeAmistad(app.locals.loguedUser.email, request.params.id, (err, success) => {
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
    app.locals.loguedUser = null;
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

//daoUsuario.nuevoUsuario(usuario, x => { console.log(x) });
//modificarUsuario(usuario, x => {
//    console.log(x);
//});

/*getUsuario("alberto@gmail.com", (x, y) => {
    console.log(x);
    console.log(y);
});*/

/*sumarPuntos("alberto@gmail.com", 100, (x, y) => {
    console.log(x);
    console.log(y);
});*/

/*crearSolicitudDeAmistad("nacho@gmail.com", "julia@gmail.com", (x, y) => {
    console.log(x + " " + y);
});*/

/*getSolicitudesDeAmistad("julia@gmail.com", (x, y) => {
    console.log(x);
    console.log(y);
});*/

/*resolverSolicitud("nacho@gmail.com", "alberto@gmail.com", 0, (x, y) => {
    console.log(x);
    console.log(y);
});*/

/*busquedaPorNombre("o", (x, y) => {
    console.log(x);
    console.log(y);
});*/

/*getAmigosUsuario("julia@gmail.com", (x, y) => {
    console.log(x);
    console.log(y);
});*/