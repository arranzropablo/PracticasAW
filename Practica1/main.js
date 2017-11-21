"use strict";

const config = require("./config");
const mysql = require("mysql");
const daoUsuarios = require("./daoUsuarios");

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

daoUsuario.nuevoUsuario(usuario, x => { console.log(x) });
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