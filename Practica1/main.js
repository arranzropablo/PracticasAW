"use strict";

const config = require("./config");
const mysql = require("mysql");
const daoUsuarios = require("./daoUsuarios");
const path = require("path");
const express = require("express");
const app = express();
let bodyParser = require("body-parser");

const ficherosEstaticos = path.join(__dirname, "public");

const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

let daoUsuario = new daoUsuarios.DaoUsuarios(pool);

let usuario = {
    email: "jajajaja@gmail.com",
    nombre: "Nacho",
    password: "funciona",
    sexo: "H",
    fecha_nacimiento: '19/04/1996',
    imagen_perfil: 'imagen.jpg',
    puntos: 50
};

//Middlewares

function usuarioConectado(request, response, next) {
    console.log("hola");
    let conectado = false;
    if (!conectado) {
        //response.redirect("/profile.html");
        response.redirect("/index.html");
    } else {
        next();
    }
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//app.use(usuarioConectado);
app.use(express.static(ficherosEstaticos));

app.get("/friends", (request, response) => {
    let usuario = "alberto@gmail.com";

    let user = {
        email: usuario,
        puntos: 50
    }

    daoUsuario.getSolicitudesDeAmistad(usuario, (err, requests) => {
        if (err) {
            console.log(err);
            response.end();
        } else {
            daoUsuario.getAmigosUsuario(usuario, (err, friends) => {
                if (err) {
                    console.log(err);
                    response.end();
                } else {
                    response.render("friends", { requests: requests, user: user, friends: friends });
                }
            });

        }
    });

});

app.get("/profile/:user", (request, response) => {
    daoUsuario.getUsuario(request.params.user, (err, user) => {
        if (err) {
            console.log(err);
            response.end();
        } else {
            response.render("profile", { user: user });
        }
    });
});

app.get("/resolver_solicitud", (request, response) => {
    let aceptada = Number(request.query.aceptada);
    let receptor = "alberto@gmail.com";
    let emisor = request.query.email;

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

    let user = {
        email: "alberto@gmail.com",
        puntos: 50
    }

    daoUsuario.busquedaPorNombre(text, (err, resultado) => {
        if (err) {
            console.log(err);
            response.end();
        } else {
            response.render("search", { resultado: resultado, user: user });
        }
    });
});

app.use(bodyParser.urlencoded({ extended: false }));
/**
 * Procesa el formulario de login del usuario
 */
app.post("/procesar_login", (request, response) => {
    daoUsuario.loginSuccessful(request.body.email, request.body.password, (err, user) => {
        if (err) {
            console.log(err);
            response.status(500);
            response.end();
        } else {
            //console.log(user);
            //response.redirect(path.join(__dirname, "/profile.html"));
            response.render("profile", { user: user });
        }
    })
});

/**
 * Procesa el formulario de registro del usuario
 */
app.post("/procesar_registro", (request, response) => {
    let user = {
        email: request.body.email,
        nombre: request.body.complete_name,
        password: request.body.password,
        sexo: request.body.genre,
        fecha_nacimiento: request.body.birth_date,
        imagen_perfil: 'imagen.jpg',
        puntos: 50
    }
    daoUsuario.nuevoUsuario(user, (err, u) => {
        if (err) {
            console.log(err);
            response.status(500);
            response.end();
        } else {
            //console.log(u);
            response.render("profile", { user: u });
        }
    })
});

/*app.get("/", (request, response) => {
    response.end("Hola!");
});

app.get("/index.html", (request, response) => {
    response.end("Te han redirigido");
});*/

app.listen(3000, (err) => {
    if (err) {
        console.error("No se pudo inicializar el servidor: " +
            err.message);
    } else {
        console.log("Servidor arrancado en el puerto 3000");
    }
});

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