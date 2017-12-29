class DaoJuegos {

    /**
     * Constructor del DAO
     * @param {Pool} pool recibe un objeto pool para gestionar las conexiones
     */
    constructor(pool) {
        this.pool = pool;
    }

    getPlayers(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, false)
            } else {
                connection.query(
                    "select u.login from partidas p join juega_en j on p.id = j.idPartida join usuarios u on u.id=j.idUsuario where p.id = ?",[id],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback("Error al realizar la consulta", null)
                        } else {
                            callback(null, filas);
                        }
                    }
                );
            }
        });
    }

    newGame(nombre, user, callback){
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, false)
            } else {
                connection.query(
                    "insert into partidas (nombre) values (?)",[nombre],
                    (err, result) => {
                        if (err) {
                            connection.release();
                            callback("Error al realizar la insercion", null)
                        } else {
                            connection.query(
                                "insert into juega_en values ((select id from usuarios where login = ?), ?)",[user, result.insertId],
                                (err, filas) => {
                                    connection.release();
                                    if (err) {
                                        callback("Error al realizar la insercion", null)
                                    } else {
                                        callback(null, true);
                                    }
                                }
                            );
                        }
                    }
                );
            }
        });
    }

    joinGame(id, user, callback){
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, false)
            } else {
                connection.query(
                    "insert into juega_en values ((select id from usuarios where login = ?), ?)",[user, id],
                    (err, result) => {
                        connection.release();
                        if (err) {
                            callback("Error al realizar la insercion", null)
                        } else {
                            callback(null, true);
                        }
                    }
                );
            }
        });
    }
}

module.exports = {
    DaoJuegos: DaoJuegos
}