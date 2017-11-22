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

//app.use(usuarioConectado);
app.use(express.static(ficherosEstaticos));

app.use(bodyParser.urlencoded({ extended: false }));
/**
 * Procesa el formulario de login del usuario
 */
app.post("/procesar_login.html", (request, response) => {
    daoUsuario.loginSuccessful(request.body.email, request.body.password, (err, user) => {
        if (err) {
            console.log(err);
        } else {
            console.log(user);
            //response.redirect(path.join(__dirname, "/profile.html"));
        }
    })
    response.end();
});
/**
 * Procesa el formulario de registro del usuario
 */
app.post("/procesar_registro.html", (request, response) => {
    let user = {
        email: request.body.email,
        nombre: request.body.complete_name,
        password: request.body.password,
        sexo: "H",
        fecha_nacimiento: request.body.birth_date,
        imagen_perfil: 'imagen.jpg',
        puntos: 50
    }
    daoUsuario.nuevoUsuario(user, (err, u) => {
        if (err) {
            console.log(err);
        } else {
            console.log(u);
        }
    })
    response.end();
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