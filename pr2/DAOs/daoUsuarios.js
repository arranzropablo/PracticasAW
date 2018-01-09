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
                callback(`Error al obtener la conexión: ${err.message}`, false)
            } else {
                connection.query(
                    "INSERT INTO usuarios (login, password) values(?,?)", [
                        usuario.login,
                        usuario.password
                    ],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback(null, false);
                        } else {
                            callback(null, true);
                        }
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
    login(usuario, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, false)
            } else {
                connection.query("SELECT * FROM usuarios WHERE login =?", [usuario.login],
                    (err, filas) => {
                        connection.release();
                        if (!err) {
                            if (filas.length > 0) {
                                if (filas[0].password === usuario.password) {
                                    callback(null, true);
                                } else {
                                    callback(null, false);
                                }
                            } else {
                                callback(null, false);
                            }
                        } else {
                            callback("Error al realizar la consulta", false)
                        }
                    }
                );
            }

        });
    }

    /**
     * Devuelve una lista de juegos en los que participa el usuario
     * @param {String} email email del user
     * @param {String} password password del user
     * @param {Function} callback
     */
    getGames(usuario, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, null)
            } else {
                connection.query("select p.id, p.nombre " +
                    "from partidas p join juega_en j on j.idPartida=p.id join usuarios u on u.id=j.idUsuario " +
                    "where login=?", [usuario],
                    (err, filas) => {
                        connection.release();
                        if (!err) {
                            callback(null, filas);
                        } else {
                            callback("Error al realizar la consulta", null);
                        }
                    }
                );
            }

        });
    }
}

module.exports = {
    DaoUsuarios: DaoUsuarios
}