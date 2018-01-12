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
                    "select u.login as login, u.id as id from partidas p join juega_en j on p.id = j.idPartida join usuarios u on u.id=j.idUsuario where p.id = ?", [id],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback("Error al realizar la consulta", null)
                        } else {
                            let players = [];
                            filas.forEach(fila => {
                                players.push({ login: fila.login, id: fila.id })
                            });
                            callback(null, players);
                        }
                    }
                );
            }
        });
    }

    newGame(nombre, user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, false)
            } else {
                connection.query(
                    "insert into partidas (nombre) values (?)", [nombre],
                    (err, result) => {
                        if (err) {
                            connection.release();
                            callback("Error al realizar la insercion", null)
                        } else {
                            connection.query(
                                "insert into juega_en values ((select id from usuarios where login = ?), ?)", [user, result.insertId],
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

    joinGame(id, user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, false)
            } else {
                connection.query(
                    "insert into juega_en values ((select id from usuarios where login = ?), ?)", [user, id],
                    (err, result) => {
                        connection.release();
                        if (err) {
                            callback("El jugador ya se ha unido a esta partida", null)
                        } else {
                            callback(null, true);
                        }
                    }
                );
            }
        });
    }

    getGames(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, false)
            } else {
                connection.query(
                    "SELECT idPartida, nombre FROM juega_en JOIN partidas ON (id = idPartida) " +
                    "WHERE idUsuario = (SELECT usuarios.id FROM usuarios WHERE login = ?)", [user],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback("Error en la consulta", null)
                        } else {
                            let partidas = [];
                            filas.forEach(fila => {
                                partidas.push({ id: fila.idPartida, nombre: fila.nombre });
                            });
                            callback(null, partidas);
                        }
                    }
                );
            }
        });
    }

    setCards(player, cartas, idPartida, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`)
            } else {
                let cardsToInsert = []
                cartas.forEach(carta => {
                    cardsToInsert.push([player.id, idPartida, carta.numero, carta.palo]);
                });
                connection.query(
                    "INSERT INTO cartas_jugador (idJugador, idPartida, numero, palo) VALUES ?", [cardsToInsert],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback("Error en la consulta")
                        } else {
                            callback(null);
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