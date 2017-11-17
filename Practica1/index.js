const mysql = require("mysql");

let pool = mysql.createPool({
    host: "91.121.109.58",
    user: "usuariop1",
    password: "accesop1",
    database: "practica1"
});

let usuario = {
    email: "alber@gmail.com",
    nombre: "Alberto Camino Sáez",
    password: "prueba",
    sexo: "H",
    fecha_nacimiento: '19/04/1996',
    imagen_perfil: 'imagen.jpg'
};

//nuevoUsuario(usuario, x => { console.log(x) });
//modificarUsuario(usuario, "ruperto@gmail.com", x => { console.log(x) });
getUsuario("alber@gmail.com", x => { console.log(x) });

/**
 * Funcion que añade un nuevo usuario a la base de datos
 * @param {Usuario} usuario Usuario nuevo que va a ser introducido en la base de datos
 * @param {Function} callback funcion que informa del proceso (como argumento tiene un String)
 */
function nuevoUsuario(usuario, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(`Error al obtener la conexión: ${err.message}`);
        } else {
            connection.query(
                "insert into usuarios values(?,?,?,?,?,?,?)",
                    [usuario.email,
                     usuario.nombre,
                     usuario.password,
                     usuario.sexo,
                     usuario.fecha_nacimiento,
                     usuario.imagen_perfil,
                     usuario.puntos],
                (err, filas) => {
                    connection.release();                    
                    if (err){ callback("No se puede añadir el usuario",null); }
                    else{ callback(null,usuario); }
                }
            );
        }

    });
}

/**
 * Funcion que modifica un usuario identificado por su email anterior
 * @param {Usuario} usuario objeto con los datos a modificar del usuario
 * @param {String} email email del usuario que se va a modificar (el anterior)
 * @param {Function} callback funcion que informa del proceso (como argumento tiene un String)
 */
function modificarUsuario(usuario, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(`Error al obtener la conexión: ${err.message}`);
        } else {
            connection.query(
                "UPDATE usuarios SET nombre=?,password=?,sexo=?,fecha_nacimiento=?,imagen_perfil=? WHERE email=?",
                    [usuario.nombre,
                     usuario.password,
                     usuario.sexo,
                     usuario.fecha_nacimiento,
                     usuario.imagen_perfil,
                     usuario.email],
                (err, filas) => {
                    connection.release();
                    if (err){ callback("No se puede modificar el usuario",null); }
                    else{ callback(null,usuario); }
                }
            );
        }
    });
}

/**
 * Comprueba el login
 * @param {String} email email del user
 * @param {String} password password del user
 * @param {Function} callback 
 */
function loginSuccessful(email, password, callback){
    getUsuario(email, (err, data) => {
        if(err){ callback(err, false); return;}
        callback(null, data.email === email && data.password === password);
    });
}

/**
 * Busca y devuelve un usuario de la base de datos identificado por el email
 * @param {String} email email del usuario que intenta hacer login o del usuario del que se quiere ver la informacion de perfil 
 * @param {Function} callback Funcion que recoge el usuario o informa del error
 */
function getUsuario(email, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(`Error al obtener la conexión: ${err.message}`);
        } else {
            connection.query("SELECT * FROM usuarios WHERE email =?",[email],
                (err, filas) => {
                    if (!err) {
                        let login;
                        filas.forEach(function(fila) {
                            login = {
                                email: fila.email,
                                nombre: fila.nombre,
                                password: fila.password,
                                sexo: fila.sexo,
                                fecha_nacimiento: fila.fecha_nacimiento,
                                imagen_perfil: fila.imagen_perfil
                            };
                        });
                        if (login !== undefined) callback(login);
                        else callback("No se ha encontrado el usuario")
                    } else callback("Ha habido un error");
                }
            );
            connection.release();
        }

    });
}
/**
 * Busca y recoge los amigos que tiene un usuario en concreto
 * @param {String} email email del usuario logueado que busca a sus amigos
 */
function getAmigosUsuario(email) {

}

/**
 * Función que devuelve las solicitudes de amistad que tiene un usuario
 * @param {String} email email del usuario logueado
 */
function getSolicitudesDeAmistad(email) {

}

/**
 * Función que devuelve una lista de usuarios donde el nombre coincide con la cadena dada
 * @param {String} cadena cadena de texto para buscar en el nombre de los usuarios
 */
function busquedaPorNombre(cadena) {

}

/**
 * Función que guarda una nueva solicitud de amistad
 * @param {String} emailEmisor email del usuario que envia la peticion de amistad
 * @param {String} emailDestinatario email del usuario que la recibe
 */
function crearSolicitudDeAmistad(emailEmisor, emailDestinatario) {

}

/**
 * Funcion para aceptar o rechazar una solicitud de amistad
 * @param {String} emailEmisor email del usuario que envia la peticion de amistad
 * @param {String} emailDestinatario email del usuario que la recibe
 * @param {bool} aceptada booleano que indica si se acepta o rechaza la solicitud
 */
function resolverSolicitud(emailEmisor, emailDestinatario, aceptada) {

}