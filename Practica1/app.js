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
function restrictLoginTemplate(request, response, next){
    if(request.session.loguedUser){
        response.redirect("/profile");
    }
    else{
        next();
    }
}
//////////////////////////////////////////////////////////////

app.get("", restrictLoginTemplate, (request, response) => {
    response.redirect("/login");
});

app.get("/login", restrictLoginTemplate, (request, response) => {
    response.render("login");
});

app.post("/procesar_login", restrictLoginTemplate, (request, response) => {
    daoUsuario.login(request.body.email, request.body.password, (err, email) => {
        if(email){
            request.session.loguedUser = email;
            request.session.profile = email;
            response.redirect("/profile"); 
        }
        else {
            //aqui redirigimos a login pero molaria hacerlo con errorMessage (lo qe viene en err) como en el ej 7
            response.redirect("/login")
        }
    })
});

app.get("/registro", restrictLoginTemplate, (request, response) => {
    response.render("registro");
});

//no funciona el procesar registro
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
    daoUsuario.nuevoUsuario(user, (err, u) => {
        if (err) {
            console.log(err);
            response.status(500);
            response.end();
        } else {
            //console.log(u);
            let currentDate = new Date();
            u.edad = Number(calcularEdad(new Date(), u.fecha_nacimiento));
            request.session.loguedUser = u;
            request.session.profile = u;
            user.myprofile = true;
            response.redirect("/profile");
            //response.render("profile", { user: u });
        }
    })
});

//Middleware que restringe el acceso sin logear
app.use((request, response, next) =>{
        if (request.session.loguedUser) {
            response.locals.user = request.session.loguedUser;            
            next();
        } else {
            response.redirect("/login");
        }
    });
////////////////////////////////////////////////

app.get("/friends", (request, response) => {
    let usuario = request.session.loguedUser;

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

    request.session.profile = request.params.user;
    response.redirect("/profile");
});

app.get("/resolver_solicitud", (request, response) => {
    let aceptada = Number(request.query.aceptada);
    let receptor = request.session.loguedUser;
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
    /*if (!buscar) {
        buscar = request.query.text;
        request.session.searchtext = buscar;
    }*/
    let user = {
        email: request.session.loguedUser,
        puntos: request.session.puntos
    }

    daoUsuario.busquedaPorNombre(buscar, request.session.loguedUser, (err, resultado) => {
        if (err) {
            console.log(err);
            response.end();
        } else {
            response.render("search", { resultado: resultado, user: user, busqueda: buscar });
        }
    });
});

app.get("/desconectar", (request, response) => {
    request.session.destroy();
    response.redirect("/login");
});

app.get("/profile", (request, response) => {
    daoUsuario.getUsuario(request.session.profile, (err, u) => {
        if (err) {
            console.log(err);
            response.status(500);
            response.end();
        } else {
            u.edad = Number(calcularEdad(new Date(), u.fecha_nacimiento));
            u.myprofile = u.email === request.session.loguedUser;
            response.render("profile", { user: u, loguedUser: request.session.loguedUser });
        }
    });
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

app.post("/addFriend/:id", (request, response) => {
    daoUsuario.crearSolicitudDeAmistad(request.session.loguedUser, request.params.id, (err, success) => {
        if (err) {
            console.log(err);
            response.status(500);
            response.end();
        } else {
            response.redirect("/friends");
        }
    });
});

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