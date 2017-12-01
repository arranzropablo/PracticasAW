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
                        "INSERT INTO preguntas (texto) VALUES (?)", [pregunta.texto],
                        (err, result) => {
                            if (err) {
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
    contestarPregunta(email, idPregunta, idRespuestaElegida, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`)
            } else {
                connection.query("INSERT INTO respuestas_usuario VALUES(?, ?, ?)", [email, idPregunta, idRespuestaElegida], err => {
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
     * Funcion que obtiene todas las preguntas de la base de datos y devuelve 5 de ellas aleatoriamente (de momento devuelve todas)
     * @param {String} email email del usuario conectado (para que no recoja las preguntas que este usuario haya respondido)
     * @param {Function} callback funcion que devuelve el error o las preguntas , en un array de objetos con la siguiente forma:
     * pregunta {
     *      id: id de la pregunta
     *      texto: titulo de la pregunta
     *      respuestas: array de objetos con la siguiente forma:
     *          id: id de la respuesta
     *          texto: texto con la respuesta
     * }
     */
    getPreguntas(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, undefined)
            } else {
                connection.query(
                    "SELECT preguntas.texto AS pregunta, respuestas.texto AS respuesta," +
                    " idPregunta, idRespuesta FROM preguntas JOIN respuestas ON id=idPregunta" +
                    " WHERE id NOT IN (SELECT idPregunta FROM respuestas_usuario WHERE email = ?)" +
                    " ORDER BY idPregunta ASC", [email],
                    (err, filas) => {
                        if (err) {
                            callback(err, undefined);
                        } else {
                            let preguntas = [];
                            let respuestas = [];
                            let idPregunta = 0;
                            let pregunta;
                            let insertar = false;
                            filas.forEach(fila => {
                                if (idPregunta !== fila.idPregunta) {
                                    if (insertar) {
                                        preguntas.push({ id: idPregunta, texto: pregunta, respuestas });
                                    } else {
                                        insertar = true;
                                    }
                                    idPregunta = fila.idPregunta;
                                    pregunta = fila.pregunta;
                                    respuestas = [];
                                }
                                respuestas.push({ id: fila.idRespuesta, texto: fila.respuesta });
                            });
                            preguntas.push({ id: idPregunta, texto: pregunta, respuestas });
                            callback(null, preguntas);
                        }
                    });
            }
        });
    }
}

module.exports = {
    DaoPreguntas: DaoPreguntas
}