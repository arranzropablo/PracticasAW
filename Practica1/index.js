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
    contrasenia: "prueba",
    sexo: "H",
    fecha_nacimiento: '1996-04-19',
    imagen_perfil: 'imagen.jpg'
};

nuevoUsuario(usuario, x => { console.log(x) });

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
                "INSERT INTO usuarios values('" + usuario.email + "','" + usuario.nombre + "','" + usuario.contrasenia +
                "','" + usuario.sexo + "','" + usuario.fecha_nacimiento + "','" + usuario.imagen_perfil + "')",
                (err, filas) => {
                    if (!err) callback("Añadido nuevo usuario");
                    else callback("No se puede añadir el usuario");
                }
            );
            connection.release();
        }

    });
}

/**
 * Funcion que modifica un usuario identificado por su email anterior
 * @param {Usuario} usuario objeto con los datos a modificar del usuario
 * @param {String} email email del usuario que se va a modificar (el anterior)
 * @param {Function} callback funcion que informa del proceso (como argumento tiene un String)
 */
function modificarUsuario(usuario, email, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(`Error al obtener la conexión: ${err.message}`);
        } else {
            connection.query(
                "UPDATE usuarios SET(nombre='" + usuario.nombre + "', email='" + usuario.email + "', contraseña='" +
                usuario.contrasenia + "', sexo='" + usuario.sexo + "', fecha_nacimiento='" + usuario.fecha_nacimiento +
                "', imagen_perfil='" + usuario.imagen_perfil + "' WHERE email ='" + email + "'",
                (err, filas) => {
                    if (!err) callback("Modificado el usuario");
                    else callback("No se puede modificar el usuario");
                }
            );
            connection.release();
        }

    });
}

/**
 * Busca un usuario en la base de datos identificado por el email
 * @param {String} email email del usuario que intenta hacer login o del usuario del que se quiere ver la informacion de perfil 
 * @param {Function} callback Funcion que recoge el usuario o informa del error
 */
function getUsuario(email, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(`Error al obtener la conexión: ${err.message}`);
        } else {
            connection.query(
                "SELECT * FROM usuarios WHERE email ='" + email + "'",
                (err, fila) => {
                    if (!err) {
                        let login = {
                            email: fila.email,
                            nombre: fila.nombre,
                            contrasenia: fila.contraseña,
                            sexo: fila.sexo,
                            fecha_nacimiento: fila.fecha_nacimiento,
                            imagen_perfil: fila.imagen_perfil
                        };
                        callback(login);
                    } else callback("No se ha encontrado el usuario");
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