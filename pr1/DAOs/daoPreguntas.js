class DaoPreguntas {

    /**
     * Constructor del DAO
     * @param {Pool} pool recibe un objeto pool para gestionar las conexiones
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Añade una nueva pregunta a la base de datos
     * @param {Object} pregunta Objeto pregunta de esta forma: {texto: titulo de la pregunta, respuestas: Array con las respuestas, cada una es un String}
     * @param {Function} callback funcion que devuelve si ha tenido un error la acción
     */
    anadirPregunta(pregunta, callback) {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    callback(`Error al obtener la conexión: ${err.message}`)
                } else {
                    connection.query(
                        "INSERT INTO preguntas (texto, numrespuestas) VALUES (?, ?)", [pregunta.texto, pregunta.numrespuestas],
                        (err, result) => {
                            if (err) {
                                connection.release();
                                callback(err);
                            } else {
                                let lastId = result.insertId;
                                if (pregunta.respuestas.length > 0) {
                                    let respuestas = [];
                                    let id = 1;
                                    pregunta.respuestas.forEach(respuesta => {
                                        respuestas.push([lastId, id, respuesta]);
                                        id++;
                                    })
                                    connection.query("INSERT INTO respuestas(idPregunta, idRespuesta, texto) values ?", [respuestas],
                                        (err) => {
                                            connection.release();
                                            if (err) {
                                                callback(err);
                                                return;
                                            }
                                            callback(null);
                                        }
                                    );
                                }
                            }
                        }
                    );
                }

            });
        }
        /**
         * Función que añade una nueva respuesta de un usuario a una pregunta
         * @param {String} email email del usuario conectado que ha respondido
         * @param {int} idPregunta id de la pregunta respondida
         * @param {int} idRespuestaElegida id de la respuesta elegida por el usuario
         * @param {Function} callback funcion que devuelve si ha tenido un error la acción
         */
    contestarPregunta(email, idPregunta, idRespuestaElegida, nuevaRespuesta, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`)
            } else {
                if (nuevaRespuesta) {
                    connection.query("INSERT INTO respuestas VALUES (?, ?, ?)", [idPregunta, idRespuestaElegida, nuevaRespuesta],
                        err => {
                            if (err) {
                                connection.release();
                                callback(err);
                            } else {
                                connection.query("INSERT INTO respuestas_usuario VALUES(?, ?, ?)", [email, idPregunta, idRespuestaElegida], err => {
                                    connection.release();
                                    if (err) {
                                        callback(err);
                                    } else {
                                        callback(null);
                                    }
                                });
                            }
                        });
                } else {
                    connection.query("INSERT INTO respuestas_usuario VALUES(?, ?, ?)", [email, idPregunta, idRespuestaElegida], err => {
                        connection.release();
                        if (err) {
                            callback(err);
                        } else {
                            callback(null);
                        }
                    });
                }
            }
        });
    }

    /**
     * Obtiene 5 preguntas aleatorias de la base de datos (solo el id y el titulo, no las respuestas)
     * @param {String} email email del usuario conectado, para que no devuelva preguntas que ha respondido ya
     * @param {Function} callback funcion que devuelve los errores o la lista de preguntas
     */
    getPreguntas(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, undefined)
            } else {
                connection.query(
                    "SELECT texto AS pregunta, id FROM preguntas" +
                    //" WHERE id NOT IN (SELECT idPregunta FROM respuestas_usuario WHERE email = ?)" +
                    " ORDER BY rand() LIMIT 5", [email],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback(err, undefined);
                        } else {
                            let preguntas = [];
                            filas.forEach(fila => {
                                preguntas.push({ id: fila.id, texto: fila.pregunta });
                            });
                            callback(null, preguntas);
                        }
                    });
            }
        });
    }

    /**
     * Funcion que devuelve una pregunta y sus respuestas asociadas dado un identificador de pregunta
     * @param {int} id id de la pregunta que se quiere obtener
     * @param {*} callback funcion que devuelve los errores o la pregunta con sus respuestas
     */
    getPregunta(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, undefined)
            } else {
                connection.query(
                    "SELECT idPregunta, preguntas.texto AS pregunta, respuestas.texto AS respuesta, idRespuesta " +
                    "FROM preguntas JOIN respuestas ON id=idPregunta WHERE idPregunta = ?", [id],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback(err, undefined);
                        } else {
                            let pregunta = {
                                id: filas[0].idPregunta,
                                texto: filas[0].pregunta,
                                respuestas: []
                            }
                            filas.forEach(fila => {
                                pregunta.respuestas.push({ id: fila.idRespuesta, texto: fila.respuesta });
                            });
                            callback(null, pregunta);
                        }
                    });
            }
        });
    }

    getPreguntaAdivinar(id, email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, undefined)
            } else {
                connection.query(
                    "SELECT numrespuestas, idRespuestaElegida FROM preguntas JOIN respuestas_usuario ON id=idPregunta " +
                    "WHERE id = ? AND email = ?", [id, email],
                    (err, filas) => {
                        if (err) {
                            connection.release();
                            callback(err, undefined);
                        } else {
                            connection.query(
                                "(SELECT idPregunta, preguntas.texto AS pregunta, respuestas.texto AS respuesta, idRespuesta " +
                                "FROM preguntas JOIN respuestas ON id=idPregunta WHERE idPregunta = ? " +
                                "AND idRespuesta = ?) UNION " +
                                "(SELECT idPregunta, preguntas.texto AS pregunta, respuestas.texto AS respuesta, idRespuesta " +
                                "FROM preguntas JOIN respuestas ON id=idPregunta WHERE idPregunta = ? AND idRespuesta != ? " +
                                "ORDER BY rand() LIMIT ?)", [id, filas[0].idRespuestaElegida, id, filas[0].idRespuestaElegida, (filas[0].numrespuestas - 1)],
                                (err, respuestas) => {
                                    connection.release();
                                    if (err) {
                                        callback(err, undefined);
                                    } else {
                                        let pregunta = {
                                            id: respuestas[0].idPregunta,
                                            texto: respuestas[0].pregunta,
                                            respuestas: []
                                        }
                                        respuestas.forEach(respuesta => {
                                            pregunta.respuestas.push({ id: respuesta.idRespuesta, texto: respuesta.respuesta });
                                        });
                                        callback(null, pregunta);
                                    }
                                });
                        }
                    });
            }
        });
    }

    /**
     * Obtiene una pregunta identificada por un id (sin respuestas) y si el usuario la ha respondido
     * @param {String} email email del usuario logueado
     * @param {int} id identificador de la pregunta
     * @param {Function} callback Función que devuelve el error de la operación o la pregunta
     */
    getPreguntaSinRespuestas(email, id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, undefined)
            } else {
                connection.query(
                    "SELECT id, (SELECT idPregunta FROM respuestas_usuario WHERE email = ? and idPregunta = ?) AS contestada " +
                    "FROM preguntas WHERE id = ?;", [email, id, id],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback(err, undefined);
                        } else {
                            let pregunta = {
                                id: filas[0].id,
                                contestada: filas[0].contestada !== null
                            }
                            callback(null, pregunta);
                        }
                    });
            }
        });
    }

    /**
     * Registra una respuesta en nombre de otro usuario por parte del usuario logueado
     * @param {String} email email del usuario logueado
     * @param {String} emailAmigo email del amigo del que quiere adivinar la respuesta
     * @param {int} idPregunta id de la pregunta a adivinar
     * @param {int} idRespuesta id de la respuesta seleccionada por el usuario (no tiene por que ser correcta)
     * @param {Function} callback funcion que devuelve un error en caso de que algo vaya mal
     */
    adivinarRespuesta(email, emailAmigo, idPregunta, acertada, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`)
            } else {
                connection.query(
                    "INSERT INTO respuestas_adivinar VALUES(?, ?, ?, ?)", [email, emailAmigo, idPregunta, acertada],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback(err);
                        } else {
                            callback(null);
                        }
                    });
            }
        });
    }

    /**
     * Recoge el id de respuesta de un usuario a una determinada pregunta
     * @param {String} email email del usuario
     * @param {int} idPregunta identificador de la pregunta
     * @param {Function} callback función que recoge el error o el id de la respuesta elegida
     */
    getRespuestaUsuario(email, idPregunta, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`)
            } else {
                connection.query(
                    "select idRespuestaElegida from respuestas_usuario where idPregunta = ? and email = ?", [idPregunta, email],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback(err, undefined);
                        } else {
                            callback(null, filas[0].idRespuestaElegida);
                        }
                    });
            }
        });
    }

    /**
     * Devuelve una lista de los amigos que han respondido una pregunta, y si el usuario ha aceptado, ha fallado, o aun no ha respondido por un amigo
     * @param {String} email email del usuario logueado
     * @param {*} idPregunta id de la pregunta
     * @param {*} callback funcion que devuelve el error o un array de objetos de la siguiente forma:
     * email: email del amigo que ha respondido la pregunta
     * acertado: null: no hay datos, o un booleano que indica si ha acertado o fallado la respuesta
     */
    getAdivinados(email, idPregunta, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, undefined)
            } else {
                connection.query(
                    "SELECT email, nombre FROM respuestas_usuario JOIN usuarios USING(email) WHERE idPregunta = ? AND " +
                    "email != ? AND (email IN (SELECT origen FROM amigos WHERE destino = ? AND pendiente = 0) " +
                    "OR email IN (SELECT destino FROM amigos WHERE origen = ? AND pendiente = 0)) " +
                    "ORDER BY email ASC;", [idPregunta, email, email, email],
                    (err, filasAmigos) => {
                        if (err) {
                            connection.release();
                            callback(err, undefined)
                        } else {
                            connection.query(
                                "SELECT emailAmigo, acertada FROM respuestas_adivinar WHERE email = ? AND idPregunta = ? ORDER BY emailAmigo ASC;", [email, idPregunta],
                                (err, filasAdivinar) => {
                                    connection.release();
                                    if (err) {
                                        callback(err, undefined);
                                    } else {
                                        let j = 0;
                                        let adivinados = [];
                                        let acertada;
                                        for (let i = 0; i < filasAmigos.length; ++i) {
                                            if (j < filasAdivinar.length && filasAmigos[i].email === filasAdivinar[j].emailAmigo) {
                                                acertada = filasAdivinar[j].acertada;
                                            } else {
                                                acertada = null;
                                            }
                                            adivinados.push({ email: filasAmigos[i].email, nombre: filasAmigos[i].nombre, acertado: acertada });
                                            if (acertada !== null) { j++; }
                                        }
                                        callback(null, adivinados);
                                    }
                                });
                        }
                    });
            }
        });
    }
}



module.exports = {
    DaoPreguntas: DaoPreguntas
}