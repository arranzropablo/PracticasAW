const mysql = require("mysql");

let pool = mysql.createPool({
    host: "91.121.109.58",
    user: "usuariop1",
    password: "accesop1",
    database: "practica1"
});

let usuario = {
    email: "alberto@gmail.com",
    nombre: "Alberto Camino Sáez",
    password: "funciona",
    sexo: "H",
    fecha_nacimiento: '19/04/1996',
    imagen_perfil: 'imagen.jpg',
    puntos: 50
};

//nuevoUsuario(usuario, x => { console.log(x) });
//modificarUsuario(usuario, x => {
//    console.log(x);
//});
/*getUsuario("alberto@gmail.com", (x, y) => {
    console.log(x);
    console.log(y);
});*/
sumarPuntos("alberto@gmail.com", 100, (x, y) => {
    console.log(x);
    console.log(y);
});

/**
 * Funcion que añade un nuevo usuario a la base de datos
 * @param {Usuario} usuario Usuario nuevo que va a ser introducido en la base de datos
 * @param {Function} callback funcion que informa del proceso (como argumento tiene un String)
 */
function nuevoUsuario(usuario, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            callback(`Error al obtener la conexión: ${err.message}`, undefined)
        } else {
            connection.query(
                "INSERT INTO usuarios values(?,?,?,?,?,?,?)", [usuario.email,
                    usuario.nombre,
                    usuario.password,
                    usuario.sexo,
                    usuario.fecha_nacimiento,
                    usuario.imagen_perfil,
                    usuario.puntos
                ],
                (err, filas) => {
                    connection.release();
                    if (err) { callback("No se puede añadir el usuario", undefined); } else { callback(null, usuario); }
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
            callback(`Error al obtener la conexión: ${err.message}`, undefined)
        } else {
            connection.query(
                "UPDATE usuarios SET nombre=?,password=?,sexo=?,fecha_nacimiento=?,imagen_perfil=? WHERE email=?", [usuario.nombre,
                    usuario.password,
                    usuario.sexo,
                    usuario.fecha_nacimiento,
                    usuario.imagen_perfil,
                    usuario.email
                ],
                (err, filas) => {
                    connection.release();
                    if (err) { callback("No se puede modificar el usuario", undefined); } else { callback(null, usuario); }
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
function loginSuccessful(email, password, callback) {
    getUsuario(email, (err, data) => {
        if (err) { callback(err, false); return; }
        if (data.password === password) {
            callback(null, true);
        } else {
            callback("La password es incorrecta", false);
        }
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
            callback(`Error al obtener la conexión: ${err.message}`, undefined)
        } else {
            connection.query("SELECT * FROM usuarios WHERE email =?", [email],
                (err, filas) => {
                    connection.release();
                    if (!err) {
                        let login;
                        if (filas.length > 0) {
                            login = {
                                email: filas[0].email,
                                nombre: filas[0].nombre,
                                password: filas[0].password,
                                sexo: filas[0].sexo,
                                fecha_nacimiento: filas[0].fecha_nacimiento,
                                imagen_perfil: filas[0].imagen_perfil,
                                puntos: filas[0].puntos
                            };
                        }
                        if (login !== undefined) { callback(null, login); } else { callback("No se ha encontrado el usuario", undefined); }
                    } else { callback("Ha habido un error", undefined); }
                }
            );
        }

    });
}

/**
 * Suma o resta una determinada cantidad de puntos a un usuario
 * @param {string} email email del usuario afectado
 * @param {int} puntos puntos a sumar/restar (si se restan, viene como número negativo)
 */
function sumarPuntos(email, puntos, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            callback(`Error al obtener la conexión: ${err.message}`, undefined)
        } else {
            connection.query(
                "UPDATE usuarios SET puntos=puntos + ? WHERE email = ?", [puntos, email],
                (err, filas) => {
                    connection.release();
                    if (!err) {
                        callback(null, puntos);
                    } else { callback(`Ha habido un error ${err.message}`, undefined); }
                }
            );
        }
    });
}
/**
 * Busca y recoge los amigos que tiene un usuario en concreto
 * @param {String} email email del usuario logueado que busca a sus amigos
 */
function getAmigosUsuario(email, callback) {
    pools.getConnection((err, connection) => {
        if (err) {
            connection.release();            
            callback(`Error al obtener la conexión: ${err.message}`, undefined);
        } else {
            connection.query(
                "select origen from amigos where pendiente=0 and destino=?", [email],
                (err, filas) => {
                    
                    if (err) {
                        connection.release();
                        callback(`Ha habido un error ${err.message}`, undefined);
                    } else {
                        connection.query(
                            "select destino from amigos where pendiente=0 and origen=?", [email],
                            (err, resultado) => {
                                if (err) {
                                    connection.release();
                                    callback(`Ha habido un error ${err.message}`, undefined);
                                } else {
                                    //No estoy seguro de si este callback funcionará hay que probarlo
                                    //para obtener los amigos de alguien tienes qe mirar los origenes y los destinos
                                    callback(null, filas + resultado);
                                }
                            }
                        )
                    }
                }
            )
        }
    });
}

/**
 * Función que devuelve las solicitudes de amistad que tiene un usuario
 * @param {String} email email del usuario logueado
 */
function getSolicitudesDeAmistad(email) {
    pools.getConnection((err, connection) => {
        if (err) {
            //No se si en el primer if(err) hay que poner el connection release, porque quizas no existe el objeto connection aun, probar poniendo mal la base de datos o algo asi
            connection.release();
            callback(`Error al obtener la conexión: ${err.message}`, undefined)
        } else {
            connection.query(
                "select origen from amigos where pendiente=1 and destino=?", [email],
                (err, filas) => {
                    connection.release();
                    if (err) {
                        callback(`Ha habido un error ${err.message}`, undefined);
                    } else {
                        callback(null, filas);
                    }
                }
            )
        }
    });
}

/**
 * Función que devuelve una lista de usuarios donde el nombre coincide con la cadena dada
 * @param {String} nombre cadena de texto para buscar en el nombre de los usuarios
 */
function busquedaPorNombre(nombre) {
    pools.getConnection((err, connection) => {
        if (err) {
            connection.release();
            callback(`Error al obtener la conexión: ${err.message}`, undefined)
        } else {
            connection.query(
                //busca que el nombre esté en cualquier posicion del nombre del usuario por ejemplo si metes "lo" te podría devolver "lorena" y "pablo" porque tienen "lo"
                "select email, nombre from usuarios where nombre like '%?%'", 
                [nombre],
                (err, filas) => {
                    connection.release();
                    if (err) {
                        callback(`Ha habido un error ${err.message}`, undefined);
                    } else {
                        callback(null, filas);
                    }
                }
            )
        }
    });
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