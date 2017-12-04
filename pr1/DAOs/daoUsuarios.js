class DaoUsuarios {

    /**
     * Constructor del DAO
     * @param {Pool} pool recibe un objeto pool para gestionar las conexiones
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Funcion que añade un nuevo usuario a la base de datos
     * @param {Usuario} usuario Usuario nuevo que va a ser introducido en la base de datos
     * @param {Function} callback funcion que informa del proceso (como argumento tiene un String)
     */
    nuevoUsuario(usuario, callback) {
        this.pool.getConnection((err, connection) => {
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
                        if (err) { callback("No se puede añadir el usuario", undefined); } else { callback(null, usuario.email); }
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
    login(email, password, callback) {
        this.getUsuario(email, (err, data) => {
            if (err) { callback(err, undefined); return; }
            if (data.password === password) {
                callback(null, data.email);
            } else {
                callback("La password es incorrecta", undefined);
            }
        });
    }

    /**
     * Funcion que modifica un usuario identificado por su email anterior
     * @param {Usuario} usuario objeto con los datos a modificar del usuario
     * @param {String} email email del usuario que se va a modificar (el anterior)
     * @param {Function} callback funcion que informa del proceso (como argumento tiene un String)
     */
    modificarUsuario(usuario, callback) {
        this.pool.getConnection((err, connection) => {
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
                        if (err) { callback("No se puede modificar el usuario", undefined); } else { callback(null, usuario.email); }
                    }
                );
            }
        });
    }

    /**
     * Busca y devuelve un usuario de la base de datos identificado por el email
     * @param {String} email email del usuario que intenta hacer login o del usuario del que se quiere ver la informacion de perfil 
     * @param {Function} callback Funcion que recoge el usuario o informa del error
     */
    getUsuario(email, callback) {
        this.pool.getConnection((err, connection) => {
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
    sumarPuntos(email, puntos, callback) {
            this.pool.getConnection((err, connection) => {
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
         * @param {Function} callback Funcion que informa del éxito o error
         */
    getAmigosUsuario(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, undefined);
            } else {
                connection.query(
                    "SELECT origen, nombre FROM amigos JOIN usuarios ON origen=email WHERE pendiente=0 and destino=?", [email],
                    (err, filas) => {

                        if (err) {
                            connection.release();
                            callback(`Ha habido un error ${err.message}`, undefined);
                        } else {
                            let amigos = [];
                            filas.forEach(fila => {
                                amigos.push({ nombre: fila.nombre, email: fila.origen });
                            })
                            connection.query(
                                "SELECT destino, nombre FROM amigos JOIN usuarios ON destino=email WHERE pendiente=0 AND origen=?", [email],
                                (err, resultado) => {
                                    connection.release();
                                    if (err) {
                                        callback(`Ha habido un error ${err.message}`, undefined);
                                    } else {
                                        resultado.forEach(fila => {
                                            amigos.push({ nombre: fila.nombre, email: fila.destino });
                                        })
                                        callback(null, amigos);
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
     * @param {Function} callback Funcion que informa del éxito o error
     */
    getSolicitudesDeAmistad(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, undefined)
            } else {
                connection.query(
                    "SELECT origen, nombre FROM amigos JOIN usuarios ON email=origen WHERE pendiente=1 and destino=?", [email],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback(`Ha habido un error ${err.message}`, undefined);
                        } else {
                            let solicitudes = [];
                            filas.forEach(fila => {
                                solicitudes.push({ nombre: fila.nombre, email: fila.origen });
                            });
                            callback(null, solicitudes);
                        }
                    }
                )
            }
        });
    }

    /**
     * Función que devuelve una lista de usuarios donde el nombre coincide con la cadena dada
     * @param {String} nombre cadena de texto para buscar en el nombre de los usuarios
     * @param {Function} callback Funcion que informa del éxito o error
     */
    busquedaPorNombre(nombre, loguedUser, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, undefined)
            } else {
                connection.query(
                    "SELECT email, nombre FROM usuarios WHERE email != ? and nombre LIKE ? and email not in " +
                    "(select origen from amigos where destino=?) and email not in " +
                    "(select destino from amigos where origen=?)", [loguedUser, "%" + nombre + "%", loguedUser, loguedUser],
                    /*"SELECT email, nombre, pendiente FROM usuarios LEFT JOIN amigos on email=origen or email=destino " +
                    "WHERE (origen = ? or destino = ? or origen is null or destino is null) " +
                    "and email != ? and nombre LIKE ?", [loguedUser, loguedUser, loguedUser, "%" + nombre + "%"],*/
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback(`Ha habido un error ${err.message}`, undefined);
                        } else {
                            let usuarios = [];
                            filas.forEach(fila => {
                                usuarios.push({ nombre: fila.nombre, email: fila.email, relacion: null });
                            });
                            callback(null, usuarios);
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
     * @param {Function} callback Funcion que informa del éxito o error
     */
    crearSolicitudDeAmistad(emailEmisor, emailDestinatario, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, undefined)
            } else {
                connection.query(
                    "INSERT INTO amigos VALUES (?, ?, 1)", [emailEmisor, emailDestinatario],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback(`Ha habido un error ${err.message}`, undefined);
                        } else {
                            callback(null, true);
                        }
                    }
                )
            }
        });
    }

    /**
     * Funcion para aceptar o rechazar una solicitud de amistad
     * @param {String} emailEmisor email del usuario que envió la peticion de amistad
     * @param {String} emailDestinatario email del usuario que la recibió
     * @param {bool} aceptada booleano que indica si se acepta o rechaza la solicitud
     * @param {Function} callback Funcion que informa del éxito o error
     */
    resolverSolicitud(emailEmisor, emailDestinatario, aceptada, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, undefined)
            } else {
                if (aceptada) {
                    connection.query(
                        "UPDATE amigos SET pendiente = 0 WHERE origen = ? AND destino = ?", [emailEmisor, emailDestinatario],
                        (err, filas) => {
                            connection.release();
                            if (err) {
                                callback(`Ha habido un error ${err.message}`, undefined);
                            } else {
                                callback(null, true);
                            }
                        }
                    )

                } else {
                    connection.query(
                        "DELETE FROM amigos WHERE origen = ? AND destino = ?", [emailEmisor, emailDestinatario],
                        (err, filas) => {
                            connection.release();
                            if (err) {
                                callback(`Ha habido un error ${err.message}`, undefined);
                            } else {
                                callback(null, true);
                            }
                        }
                    )
                }
            }
        });
    }
}

module.exports = {
    DaoUsuarios: DaoUsuarios
}